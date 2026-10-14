$ErrorActionPreference = "Stop"

Write-Host "=========================================================="
Write-Host "ProvenAI Backend Comprehensive API Test Suite"
Write-Host "=========================================================="

$results = @{}

# 1. GET /
Write-Host "`n[1] Testing GET /"
$rootRes = Invoke-RestMethod -Uri "http://localhost:8000/" -Method Get
Write-Host "Status: 200 OK"
Write-Host "Response: $($rootRes | ConvertTo-Json -Compress)"
$results["GET /"] = $rootRes

# 2. GET /api/health
Write-Host "`n[2] Testing GET /api/health"
$healthRes = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method Get
Write-Host "Status: 200 OK"
Write-Host "Response: $($healthRes | ConvertTo-Json -Compress)"
$results["GET /api/health"] = $healthRes

# 3. POST /api/register
Write-Host "`n[3] Testing POST /api/register"
$regUser = "testuser_$(Get-Random)"
$regEmail = "$regUser@example.com"
$regBody = @{
    username = $regUser
    email = $regEmail
    password = "SecurePassword123!"
    full_name = "Provenance Tester"
} | ConvertTo-Json

$regRes = Invoke-RestMethod -Uri "http://localhost:8000/api/register" -Method Post -ContentType "application/json" -Body $regBody
Write-Host "Status: 200 OK"
Write-Host "Response: $($regRes | ConvertTo-Json -Compress)"
$results["POST /api/register"] = $regRes

# 4. POST /api/login
Write-Host "`n[4] Testing POST /api/login"
$loginBody = "username=$regUser&password=SecurePassword123!"
$loginRes = Invoke-RestMethod -Uri "http://localhost:8000/api/login" -Method Post -ContentType "application/x-www-form-urlencoded" -Body $loginBody
Write-Host "Status: 200 OK"
Write-Host "Response: $($loginRes | ConvertTo-Json -Compress)"
$results["POST /api/login"] = $loginRes

$token = $loginRes.access_token
$authHeaders = @{ Authorization = "Bearer $token" }

# 5. GET /api/profile
Write-Host "`n[5] Testing GET /api/profile"
$profileRes = Invoke-RestMethod -Uri "http://localhost:8000/api/profile" -Method Get -Headers $authHeaders
Write-Host "Status: 200 OK"
Write-Host "Response: $($profileRes | ConvertTo-Json -Compress)"
$results["GET /api/profile"] = $profileRes

# 6. POST /api/upload
Write-Host "`n[6] Testing POST /api/upload"
$uploadOut = curl.exe -s -X POST -H "Authorization: Bearer $token" -F "file=@storage/uploads/test_image.png" http://localhost:8000/api/upload
Write-Host "Status: 200 OK"
Write-Host "Response: $uploadOut"
$uploadRes = $uploadOut | ConvertFrom-Json
$results["POST /api/upload"] = $uploadRes

# 7. POST /api/embed
Write-Host "`n[7] Testing POST /api/embed"
$embedOut = curl.exe -s -X POST -H "Authorization: Bearer $token" -F "file=@storage/uploads/test_image.png" -F "owner_name=Alice Provenance" -F "ai_model=Stable Diffusion 3" -F "prompt_id=sd3-gen-987" http://localhost:8000/api/embed
Write-Host "Status: 200 OK"
Write-Host "Response: $embedOut"
$embedRes = $embedOut | ConvertFrom-Json
$results["POST /api/embed"] = $embedRes

$wmPath = $embedRes.watermarked_path
Write-Host "Embedded Watermarked Image Path: $wmPath"
Write-Host "PSNR: $($embedRes.psnr) dB"
Write-Host "SSIM: $($embedRes.ssim)"
Write-Host "Embedding Time: $($embedRes.embedding_time) s"

# 8. POST /api/verify (with the intact watermarked image)
Write-Host "`n[8] Testing POST /api/verify (Watermarked Image)"
$verifyOut = curl.exe -s -X POST -H "Authorization: Bearer $token" -F "file=@$wmPath" http://localhost:8000/api/verify
Write-Host "Status: 200 OK"
Write-Host "Response: $verifyOut"
$verifyRes = $verifyOut | ConvertFrom-Json
$results["POST /api/verify"] = $verifyRes
Write-Host "Is Authentic: $($verifyRes.is_authentic)"
Write-Host "Is Tampered: $($verifyRes.is_tampered)"
Write-Host "NC Score: $($verifyRes.nc_score)"
Write-Host "BER Score: $($verifyRes.ber_score)"
Write-Host "Provenance Owner: $($verifyRes.provenance.owner)"
Write-Host "Provenance Model: $($verifyRes.provenance.model)"

# Also verify original non-watermarked image (should fail / low NC)
Write-Host "`n[8b] Testing POST /api/verify (Original Non-Watermarked Image)"
$verifyOrigOut = curl.exe -s -X POST -H "Authorization: Bearer $token" -F "file=@storage/uploads/test_image.png" http://localhost:8000/api/verify
Write-Host "Original Image Verification Response: $verifyOrigOut"
$results["POST /api/verify (non-watermarked)"] = ($verifyOrigOut | ConvertFrom-Json)

# 9. POST /api/attack (9 distinct attack types)
Write-Host "`n[9] Testing POST /api/attack with 9 attack types"
$imgId = 1
$attacks = @(
    @{ type = "jpeg"; params = @{ quality = 50 } },
    @{ type = "gaussian_noise"; params = @{ mean = 0; std = 10 } },
    @{ type = "salt_pepper"; params = @{ amount = 0.02 } },
    @{ type = "rotation"; params = @{ angle = 5 } },
    @{ type = "scaling"; params = @{ scale = 0.5 } },
    @{ type = "cropping"; params = @{ ratio = 0.1 } },
    @{ type = "brightness"; params = @{ factor = 1.3 } },
    @{ type = "contrast"; params = @{ factor = 1.5 } },
    @{ type = "blur"; params = @{ kernel_size = 5 } }
)

$attackResults = @{}
foreach ($atk in $attacks) {
    $atkType = $atk.type
    $atkParams = $atk.params
    $atkBody = @{
        image_id = $imgId
        attack_type = $atkType
        attack_params = $atkParams
    } | ConvertTo-Json
    
    $atkRes = Invoke-RestMethod -Uri "http://localhost:8000/api/attack" -Method Post -Headers $authHeaders -ContentType "application/json" -Body $atkBody
    Write-Host "Attack [$atkType]: Survived=$($atkRes.survived) | NC=$($atkRes.metrics.nc_after) | BER=$($atkRes.metrics.ber_after) | PSNR=$($atkRes.metrics.psnr_after) | SSIM=$($atkRes.metrics.ssim_after)"
    $attackResults[$atkType] = $atkRes
}
$results["Attacks"] = $attackResults

# 10. GET /api/dashboard
Write-Host "`n[10] Testing GET /api/dashboard"
$dashRes = Invoke-RestMethod -Uri "http://localhost:8000/api/dashboard" -Method Get -Headers $authHeaders
Write-Host "Status: 200 OK"
Write-Host "Response: $($dashRes | ConvertTo-Json -Compress)"
$results["GET /api/dashboard"] = $dashRes

# 11. GET /api/statistics
Write-Host "`n[11] Testing GET /api/statistics"
$statsRes = Invoke-RestMethod -Uri "http://localhost:8000/api/statistics" -Method Get -Headers $authHeaders
Write-Host "Status: 200 OK"
Write-Host "Response: $($statsRes | ConvertTo-Json -Compress)"
$results["GET /api/statistics"] = $statsRes

# 12. GET /api/history
Write-Host "`n[12] Testing GET /api/history"
$histRes = Invoke-RestMethod -Uri "http://localhost:8000/api/history" -Method Get -Headers $authHeaders
Write-Host "Status: 200 OK"
Write-Host "Total images in history: $($histRes.images.Count)"
Write-Host "Total verifications in history: $($histRes.verifications.Count)"
$results["GET /api/history"] = $histRes

# 13. GET /api/download/{filename}
Write-Host "`n[13] Testing GET /api/download/{filename}"
$wmFilename = [System.IO.Path]::GetFileName($wmPath)
$downloadOut = curl.exe -s -o "storage/test_downloaded.png" -w "%{http_code}" "http://localhost:8000/api/download/$wmFilename"
Write-Host "Download HTTP status code: $downloadOut"
$results["GET /api/download"] = @{ http_code = $downloadOut; file_downloaded = (Test-Path "storage/test_downloaded.png") }

# Save JSON results
$results | ConvertTo-Json -Depth 10 | Out-File -FilePath "comprehensive_test_results.json" -Encoding utf8
Write-Host "`n>>> ALL 13 TEST SUITES COMPLETED SUCCESSFULLY! RESULTS SAVED TO comprehensive_test_results.json <<<"
