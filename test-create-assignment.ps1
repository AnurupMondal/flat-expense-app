# Test creating a new assignment
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body (@{
    email = "superadmin@demo.com"
    password = "Demo123!"
} | ConvertTo-Json) -ContentType "application/json"

if ($loginResponse.success) {
    $token = $loginResponse.data.token
    Write-Host "Login successful" -ForegroundColor Green
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    # Get available admins and buildings
    $adminsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/admin-assignments/available-admins" -Method GET -Headers $headers
    $buildingsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/buildings" -Method GET -Headers $headers
    
    if ($adminsResponse.data.Count -gt 0 -and $buildingsResponse.data.buildings.Count -gt 0) {
        $admin = $adminsResponse.data[0]
        $building = $buildingsResponse.data.buildings[2]  # Try Green Valley (index 2)
        
        Write-Host ""
        Write-Host "Attempting to assign:" -ForegroundColor Yellow
        Write-Host "  Admin: $($admin.name) (ID: $($admin.id))" -ForegroundColor Cyan
        Write-Host "  Building: $($building.name) (ID: $($building.id))" -ForegroundColor Cyan
        
        # Try to create assignment
        try {
            $assignmentBody = @{
                adminId = $admin.id
                buildingId = $building.id
            } | ConvertTo-Json
            
            Write-Host ""
            Write-Host "Sending request body:" -ForegroundColor Magenta
            Write-Host $assignmentBody
            
            $createResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/admin-assignments" -Method POST -Headers $headers -Body $assignmentBody
            
            Write-Host ""
            Write-Host "SUCCESS!" -ForegroundColor Green
            Write-Host "Response:" -ForegroundColor Green
            $createResponse | ConvertTo-Json -Depth 3
        } catch {
            Write-Host ""
            Write-Host "FAILED!" -ForegroundColor Red
            Write-Host "Error: $_" -ForegroundColor Red
            Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        }
    }
}
