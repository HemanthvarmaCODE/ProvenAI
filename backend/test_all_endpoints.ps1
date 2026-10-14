$ErrorActionPreference = "Stop"
$results = @{}

Write-Host "=== TEST 1: GET / ==="
$res1 = Invoke-RestMethod -Uri "http://localhost:8000/" -Method Get
Write-Host "GET / Response: $($res1 | ConvertTo-Json -Compress)"
$results["GET /"] = $res1

Write-Host "=== TEST 2: GET /api/health ==="
$res2 = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method Get
Write-Host "GET /api/health Response: $($res2 | ConvertTo-Json -Compress)"
$results["GET /api/health"] = $res2

Write-Host "=== TEST 3: POST /api/register ==="
$regBody = @{
    username = "testuser"
    email = "testuser@example.com"
    password = "SecretPassword123!"
    full_name = "Test User"
} | ConvertTo-Json
$res3 = Invoke-RestMethod -Uri "http://localhost:8000/api/register" -Method Post -ContentType "application/json" -Body $regBody
Write-Host "POST /api/register Response: $($res3 | ConvertTo-Json -Compress)"
$results["POST /api/register"] = $res3
$token = $res3.access_token

Write-Host "=== TEST 4: POST /api/login ==="
$loginForm = @{
    username = "testuser"
    password = "SecretPassword123!"
}
$res4 = Invoke-RestMethod -Uri "http://localhost:8000/api/login" -Method Post -Body $loginForm
Write-Host "POST /api/login Response: $($res4 | ConvertTo-Json -Compress)"
$results["POST /api/login"] = $res4
$token = $res4.access_token
$authHeaders = @{ Authorization = "Bearer $token" }

Write-Host "=== TEST 5: GET /api/profile ==="
$res5 = Invoke-RestMethod -Uri "http://localhost:8000/api/profile" -Method Get -Headers $authHeaders
Write-Host "GET /api/profile Response: $($res5 | ConvertTo-Json -Compress)"
$results["GET /api/profile"] = $res5

Write-Host "=== TEST 6: POST /api/upload ==="
$uploadForm = @{
    file = Get-Item "storage/uploads/test_image.png"
}
$res6 = Invoke-RestMethod -Uri "http://localhost:8000/api/upload" -Method Post -Headers $authHeaders -Form $uploadForm
Write-Host "POST /api/upload Response: $($res6 | ConvertTo-Json -Compress)"
$results["POST /api/upload"] = $res6

Write-Host "=== TEST 7: POST /api/embed ==="
$embedForm = @{
    file = Get-Item "storage/uploads/test_image.png"
    owner_name = "Test User"
    ai_model = "DALL-E 3"
    prompt_id = "test-prompt-001"
}
$res7 = Invoke-RestMethod -Uri "http://localhost:8000/api/embed" -Method Post -Headers $authHeaders -Form $embedForm
Write-Host "POST /api/embed Response: $($res7 | ConvertTo-Json -Compress)"
$results["POST /api/embed"] = $res7
$wmPath = $res7.watermarked_path

Write-Host "=== TEST 8: POST /api/verify (Watermarked Image) ==="
$verifyForm = @{
    file = Get-Item $wmPath
}
$res8 = Invoke-RestMethod -Uri "http://localhost:8000/api/verify" -Method Post -Headers $authHeaders -Form $verifyForm
Write-Host "POST /api/verify (Watermarked) Response: $($res8 | ConvertTo-Json -Compress)"
$results["POST /api/verify"] = $res8

Write-Host "=== TEST 9: POST /api/attack (Various Attacks) ==="
$imgId = 1
$attacks = @(
    @{ type = "jpeg"; params = @{ quality = 70 } },
    @{ type = "gaussian_noise"; params = @{ mean = 0; std = 10 } },
    @{ type = "salt_pepper"; params = @{ amount = 0.02 } },
    @{ type = "rotation"; params = @{ angle = 5 } },
    @{ type = "scaling"; params = @{ scale = 0.5 } },
    @{ type = "cropping"; params = @{ ratio = 0.1 } },
    @{ type = "brightness"; params = @{ factor = 1.2 } },
    @{ type = "contrast"; params = @{ factor = 1.3 } },
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
    Write-Host "Attack [$atkType] Response: $($atkRes | ConvertTo-Json -Compress)"
    $attackResults[$atkType] = $atkRes
}
$results["Attacks"] = $attackResults

Write-Host "=== TEST 10: GET /api/dashboard ==="
$res10 = Invoke-RestMethod -Uri "http://localhost:8000/api/dashboard" -Method Get -Headers $authHeaders
Write-Host "GET /api/dashboard Response: $($res10 | ConvertTo-Json -Compress)"
$results["GET /api/dashboard"] = $res10

Write-Host "=== TEST 11: GET /api/statistics ==="
$res11 = Invoke-RestMethod -Uri "http://localhost:8000/api/statistics" -Method Get -Headers $authHeaders
Write-Host "GET /api/statistics Response: $($res11 | ConvertTo-Json -Compress)"
$results["GET /api/statistics"] = $res11

Write-Host "=== TEST 12: GET /api/history ==="
$res12 = Invoke-RestMethod -Uri "http://localhost:8000/api/history" -Method Get -Headers $authHeaders
Write-Host "GET /api/history Response: $($res12 | ConvertTo-Json -Compress)"
$results["GET /api/history"] = $res12

# Save results to JSON file
$results | ConvertTo-Json -Depth 10 | Out-File -FilePath "test_results.json" -Encoding utf8
Write-Host "All tests completed successfully!"
