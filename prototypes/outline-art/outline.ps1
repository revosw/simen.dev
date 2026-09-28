# Turns cel-shaded character art (Wind Waker style: black ink lines around flat colour)
# into a one-colour outline drawing: the ink lines in -Line colour, everything else gone.
#
#   .\outline.ps1 -In medli.png                      # writes medli-outline.png and medli-lines.png
#   .\outline.ps1 -In medli.png -Dark 50 -Light 120  # tune which darkness counts as ink
#   .\outline.ps1 -In medli.png -MinSpeck 80         # remove bigger specks of texture
#
# medli-outline.png: lines on the -Background colour (a preview of the look).
# medli-lines.png:   lines on transparency (for layering in the overlay).
#
# A pixel's "inkness" goes from 1 at brightness <= -Dark to 0 at brightness >= -Light, so
# anti-aliased line edges stay smooth. Transparent pixels are never ink. Then specks are
# removed: solid ink blobs smaller than -MinSpeck pixels, and soft (partial) ink that
# doesn't touch a solid line, which is how shading texture shows up.
param(
	[Parameter(Mandatory)] [string] $In,
	[string] $Background = "#0d131f",
	[string] $Line = "#2b3954",
	[int] $Dark = 60,
	[int] $Light = 110,
	[int] $MinSpeck = 40,
	# Ink is colourless: pixels whose chroma (max - min of R, G, B) exceeds this are not ink,
	# however dark. 255 turns it off. Useful for dark, saturated fills (e.g. a navy stripe).
	[int] $MaxChroma = 255,
	# Added to the output names, to keep variants apart, e.g. -Suffix "-brown".
	[string] $Suffix = ""
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
# PowerShell 7 (.NET) keeps the drawing types in these two assemblies.
Add-Type -ReferencedAssemblies System.Drawing.Common, System.Drawing.Primitives -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class OutlineArt {
    // Returns ink coverage (0-255) per pixel.
    public static byte[] Ink(Bitmap src, int dark, int light, int maxChroma) {
        var rect = new Rectangle(0, 0, src.Width, src.Height);
        var data = src.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        var px = new byte[data.Stride * src.Height];
        Marshal.Copy(data.Scan0, px, 0, px.Length);
        src.UnlockBits(data);
        var ink = new byte[src.Width * src.Height];
        for (int y = 0; y < src.Height; y++)
            for (int x = 0; x < src.Width; x++) {
                int i = y * data.Stride + x * 4;
                double b = px[i], g = px[i + 1], r = px[i + 2], a = px[i + 3] / 255.0;
                double lum = 0.299 * r + 0.587 * g + 0.114 * b;
                double t = Math.Max(0, Math.Min(1, (light - lum) / (light - dark)));
                // Fade out over 20 units of chroma above maxChroma.
                double chroma = Math.Max(r, Math.Max(g, b)) - Math.Min(r, Math.Min(g, b));
                t *= Math.Max(0, Math.Min(1, (maxChroma + 20 - chroma) / 20.0));
                ink[y * src.Width + x] = (byte)Math.Round(255 * t * a);
            }
        return ink;
    }

    // Removes solid blobs (ink >= 128) smaller than minArea, then soft ink not touching solid ink.
    public static void Despeckle(byte[] ink, int w, int h, int minArea) {
        var keep = new bool[w * h];
        var seen = new bool[w * h];
        // Plain arrays as stack and blob list (no extra assembly references needed).
        var stack = new int[w * h];
        var blob = new int[w * h];
        for (int start = 0; start < w * h; start++) {
            if (seen[start] || ink[start] < 128) continue;
            int top = 0, count = 0;
            stack[top++] = start;
            seen[start] = true;
            while (top > 0) {
                int p = stack[--top];
                blob[count++] = p;
                int px = p % w, py = p / w;
                for (int dy = -1; dy <= 1; dy++)
                    for (int dx = -1; dx <= 1; dx++) {
                        int nx = px + dx, ny = py + dy;
                        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
                        int n = ny * w + nx;
                        if (seen[n] || ink[n] < 128) continue;
                        seen[n] = true;
                        stack[top++] = n;
                    }
            }
            if (count >= minArea) for (int k = 0; k < count; k++) keep[blob[k]] = true;
        }
        var result = new byte[w * h];
        for (int y = 0; y < h; y++)
            for (int x = 0; x < w; x++) {
                int p = y * w + x;
                if (keep[p]) { result[p] = ink[p]; continue; }
                if (ink[p] >= 128 || ink[p] == 0) continue;
                // Soft ink: keep only along the edge of a kept line.
                bool touches = false;
                for (int dy = -1; dy <= 1 && !touches; dy++)
                    for (int dx = -1; dx <= 1; dx++) {
                        int nx = x + dx, ny = y + dy;
                        if (nx >= 0 && ny >= 0 && nx < w && ny < h && keep[ny * w + nx]) { touches = true; break; }
                    }
                if (touches) result[p] = ink[p];
            }
        Array.Copy(result, ink, ink.Length);
    }

    // Paints the ink in `line` over `background` (or over transparency when background is null).
    public static Bitmap Paint(byte[] ink, int w, int h, Color line, Color? background) {
        var bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
        var rect = new Rectangle(0, 0, w, h);
        var data = bmp.LockBits(rect, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
        var px = new byte[data.Stride * h];
        for (int y = 0; y < h; y++)
            for (int x = 0; x < w; x++) {
                int i = y * data.Stride + x * 4;
                double t = ink[y * w + x] / 255.0;
                if (background.HasValue) {
                    var bg = background.Value;
                    px[i] = (byte)Math.Round(bg.B + (line.B - bg.B) * t);
                    px[i + 1] = (byte)Math.Round(bg.G + (line.G - bg.G) * t);
                    px[i + 2] = (byte)Math.Round(bg.R + (line.R - bg.R) * t);
                    px[i + 3] = 255;
                } else {
                    px[i] = line.B; px[i + 1] = line.G; px[i + 2] = line.R;
                    px[i + 3] = ink[y * w + x];
                }
            }
        Marshal.Copy(px, 0, data.Scan0, px.Length);
        bmp.UnlockBits(data);
        return bmp;
    }
}
"@

$inPath = (Resolve-Path $In).Path
$src = [System.Drawing.Bitmap]::FromFile($inPath)
$ink = [OutlineArt]::Ink($src, $Dark, $Light, $MaxChroma)
$w = $src.Width; $h = $src.Height
$src.Dispose()
if ($MinSpeck -gt 0) { [OutlineArt]::Despeckle($ink, $w, $h, $MinSpeck) }

$lineColor = [System.Drawing.ColorTranslator]::FromHtml($Line)
$bgColor = [System.Drawing.ColorTranslator]::FromHtml($Background)
$base = (Join-Path (Split-Path $inPath) ([IO.Path]::GetFileNameWithoutExtension($inPath))) + $Suffix

$preview = [OutlineArt]::Paint($ink, $w, $h, $lineColor, $bgColor)
$preview.Save("$base-outline.png", [System.Drawing.Imaging.ImageFormat]::Png); $preview.Dispose()
$lines = [OutlineArt]::Paint($ink, $w, $h, $lineColor, $null)
$lines.Save("$base-lines.png", [System.Drawing.Imaging.ImageFormat]::Png); $lines.Dispose()

$covered = ($ink | Where-Object { $_ -gt 127 }).Count
"Wrote $base-outline.png and $base-lines.png ($w x $h, {0:P1} of pixels are ink)" -f ($covered / ($w * $h))
