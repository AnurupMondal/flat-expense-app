# Test assignment API - simplified
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body (@{
    email = "superadmin@demo.com"
    password = "Demo123!"
} | ConvertTo-Json) -ContentType "application/json"

if ($loginResponse.success) {
    $token = $loginResponse.data.token
    Write-Host "Login successful" -ForegroundColor Green
    
    # Get assignments
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $assignmentsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/admin-assignments" -Method GET -Headers $headers
    
    Write-Host ""
    Write-Host "=== CURRENT ASSIGNMENTS ===" -ForegroundColor Cyan
    if ($assignmentsResponse.data.Count -eq 0) {
        Write-Host "No assignments found!" -ForegroundColor Red
    } else {
        foreach ($assignment in $assignmentsResponse.data) {
            Write-Host "- $($assignment.admin_name) assigned to $($assignment.building_name)" -ForegroundColor Yellow
        }
    }
    
    # Get available admins
    $adminsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/admin-assignments/available-admins" -Method GET -Headers $headers
    
    Write-Host ""
    Write-Host "=== AVAILABLE ADMINS ===" -ForegroundColor Cyan
    foreach ($admin in $adminsResponse.data) {
        Write-Host "- $($admin.name) ($($admin.email))" -ForegroundColor Yellow
    }
} else {
    Write-Host "Login failed!" -ForegroundColor Red
}
