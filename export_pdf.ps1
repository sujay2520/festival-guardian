try {
    $ppt = New-Object -ComObject PowerPoint.Application
    $file = "D:\Downloads\Festival-Guardian-Grand-Finale.pptx"
    $pdf = "D:\Downloads\Festival-Guardian-Grand-Finale.pdf"
    $doc = $ppt.Presentations.Open($file, 1, 0, 0)
    $doc.SaveAs($pdf, 32)
    $doc.Close()
    $ppt.Quit()
    Write-Host "SUCCESS: PDF generated at $pdf"
} catch {
    Write-Warning "PowerPoint COM error: $($_.Exception.Message)"
}
