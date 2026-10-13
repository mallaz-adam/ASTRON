# Rebuild the install icons using Windows' built-in drawing tools.
Add-Type -AssemblyName System.Drawing
$iconDirectory = Join-Path $PSScriptRoot '../public/icons'
New-Item -ItemType Directory -Path $iconDirectory -Force | Out-Null
foreach ($size in @(180, 192, 512)) {
    $bitmap = [System.Drawing.Bitmap]::new($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#E9DBBB'))
    $scale = $size / 512.0
    $graphics.ScaleTransform($scale, $scale)
    $ink = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#2A1C13'), 4)
    $line = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#7A6544'), 2)
    $accent = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#8F2D1F'))
    $graphics.DrawEllipse($ink, 104, 104, 304, 304)
    $graphics.DrawEllipse($line, 124, 124, 264, 264)
    $points = [System.Drawing.PointF[]]@(
        [System.Drawing.PointF]::new(256, 140), [System.Drawing.PointF]::new(284, 228),
        [System.Drawing.PointF]::new(372, 256), [System.Drawing.PointF]::new(284, 284),
        [System.Drawing.PointF]::new(256, 372), [System.Drawing.PointF]::new(228, 284),
        [System.Drawing.PointF]::new(140, 256), [System.Drawing.PointF]::new(228, 228)
    )
    $graphics.FillPolygon($accent, $points)
    $graphics.DrawPolygon($ink, $points)
    $filename = if ($size -eq 180) { 'apple-touch-icon.png' } else { "icon-$size.png" }
    $bitmap.Save((Join-Path $iconDirectory $filename), [System.Drawing.Imaging.ImageFormat]::Png)
    $accent.Dispose()
    $line.Dispose()
    $ink.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
}
