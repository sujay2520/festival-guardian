$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$outDir = "C:\Users\jarvis\Desktop\Builds\Iqoo hackathon\Festival Guardian\screenshots"
$artifactDir = "C:\Users\jarvis\.gemini\antigravity\brain\614662a1-978b-494f-a1a5-ce6ed9734b2c"
$tempDir = "C:\Users\jarvis\AppData\Local\Temp\festival-ss"

if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force }
if (-not (Test-Path $tempDir)) { New-Item -ItemType Directory -Path $tempDir -Force }

$shots = @(
  @{ name = "01-scanner-desktop.png"; url = "https://festival-guardian.vercel.app?tab=scanner"; w = 1280; h = 820 },
  @{ name = "02-dispatch-desktop.png"; url = "https://festival-guardian.vercel.app?tab=dispatch"; w = 1280; h = 820 },
  @{ name = "03-relay-desktop.png"; url = "https://festival-guardian.vercel.app?tab=relay"; w = 1280; h = 820 },
  @{ name = "04-sos-desktop.png"; url = "https://festival-guardian.vercel.app?tab=sos"; w = 1280; h = 820 },
  @{ name = "05-ops-desktop.png"; url = "https://festival-guardian.vercel.app?tab=ops"; w = 1280; h = 820 },
  @{ name = "06-scanner-mobile.png"; url = "https://festival-guardian.vercel.app?tab=scanner"; w = 412; h = 880 },
  @{ name = "07-ops-mobile.png"; url = "https://festival-guardian.vercel.app?tab=ops"; w = 412; h = 880 },
  @{ name = "08-sos-mobile.png"; url = "https://festival-guardian.vercel.app?tab=sos"; w = 412; h = 880 },
  @{ name = "09-relay-mobile.png"; url = "https://festival-guardian.vercel.app?tab=relay"; w = 412; h = 880 },
  @{ name = "10-dispatch-mobile.png"; url = "https://festival-guardian.vercel.app?tab=dispatch"; w = 412; h = 880 }
)

foreach ($s in $shots) {
  $tempShot = "$tempDir\$($s.name)"
  $userProfile = "$tempDir\profile-$($s.name)"
  if (Test-Path $tempShot) { Remove-Item $tempShot -Force }

  Write-Host "Capturing $($s.name)..."
  & $chromePath --headless=new --no-sandbox --user-data-dir="$userProfile" --screenshot="$tempShot" --window-size="$($s.w),$($s.h)" $s.url 2>$null
  
  Start-Sleep -Milliseconds 800

  if (Test-Path $tempShot) {
    Copy-Item $tempShot "$outDir\$($s.name)" -Force
    Copy-Item $tempShot "$artifactDir\$($s.name)" -Force
    Write-Host " Saved: $($s.name)" -ForegroundColor Green
  } else {
    Write-Warning " Failed to capture $($s.name)"
  }
}

Write-Host "All screenshots captured in $outDir"
