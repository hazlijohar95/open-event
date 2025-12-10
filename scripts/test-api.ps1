# ============================================================================
# Open Event API Test Script
# ============================================================================
# Usage: .\scripts\test-api.ps1 -ApiKey "oe_live_your_key_here"
# ============================================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey
)

$BaseUrl = "https://giddy-reindeer-109.convex.site"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Open Event API Test Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Base URL: $BaseUrl" -ForegroundColor Yellow
Write-Host "API Key: $($ApiKey.Substring(0, 20))..." -ForegroundColor Yellow
Write-Host ""

# Helper function to make API calls
function Invoke-Api {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = $null,
        [switch]$RequireAuth
    )
    
    $uri = "$BaseUrl$Endpoint"
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($RequireAuth) {
        $headers["X-API-Key"] = $ApiKey
    }
    
    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body $jsonBody
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers
        }
        return @{
            Success = $true
            Data = $response
        }
    } catch {
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        return @{
            Success = $false
            Error = $errorResponse
            StatusCode = $_.Exception.Response.StatusCode.value__
        }
    }
}

# ----------------------------------------------------------------------------
# Test 1: Health Check (No Auth)
# ----------------------------------------------------------------------------
Write-Host "1. Testing Health Check..." -ForegroundColor Green
$result = Invoke-Api -Method GET -Endpoint "/api/health"
if ($result.Success) {
    Write-Host "   ✓ Status: $($result.Data.data.status)" -ForegroundColor Green
    Write-Host "   ✓ Version: $($result.Data.data.version)" -ForegroundColor Green
} else {
    Write-Host "   ✗ Failed" -ForegroundColor Red
}
Write-Host ""

# ----------------------------------------------------------------------------
# Test 2: API Info (No Auth)
# ----------------------------------------------------------------------------
Write-Host "2. Testing API Info..." -ForegroundColor Green
$result = Invoke-Api -Method GET -Endpoint "/api/v1"
if ($result.Success) {
    Write-Host "   ✓ API Name: $($result.Data.data.name)" -ForegroundColor Green
    Write-Host "   ✓ Version: $($result.Data.data.version)" -ForegroundColor Green
} else {
    Write-Host "   ✗ Failed" -ForegroundColor Red
}
Write-Host ""

# ----------------------------------------------------------------------------
# Test 3: Public Events (No Auth)
# ----------------------------------------------------------------------------
Write-Host "3. Testing Public Events (No Auth)..." -ForegroundColor Green
$result = Invoke-Api -Method GET -Endpoint "/api/v1/public/events"
if ($result.Success) {
    Write-Host "   ✓ Total Events: $($result.Data.meta.total)" -ForegroundColor Green
} else {
    Write-Host "   ✗ Failed" -ForegroundColor Red
}
Write-Host ""

# ----------------------------------------------------------------------------
# Test 4: Public Vendors (No Auth)
# ----------------------------------------------------------------------------
Write-Host "4. Testing Public Vendors (No Auth)..." -ForegroundColor Green
$result = Invoke-Api -Method GET -Endpoint "/api/v1/public/vendors"
if ($result.Success) {
    Write-Host "   ✓ Total Vendors: $($result.Data.meta.total)" -ForegroundColor Green
} else {
    Write-Host "   ✗ Failed" -ForegroundColor Red
}
Write-Host ""

# ----------------------------------------------------------------------------
# Test 5: List Events (Auth Required)
# ----------------------------------------------------------------------------
Write-Host "5. Testing List Events (Auth Required)..." -ForegroundColor Green
$result = Invoke-Api -Method GET -Endpoint "/api/v1/events" -RequireAuth
if ($result.Success) {
    Write-Host "   ✓ Total Events: $($result.Data.meta.total)" -ForegroundColor Green
    Write-Host "   ✓ Authentication working!" -ForegroundColor Green
} else {
    Write-Host "   ✗ Failed: $($result.Error.error.message)" -ForegroundColor Red
}
Write-Host ""

# ----------------------------------------------------------------------------
# Test 6: Create Event (Auth Required)
# ----------------------------------------------------------------------------
Write-Host "6. Testing Create Event (Auth Required)..." -ForegroundColor Green
$tomorrow = [long]((Get-Date).AddDays(30).ToUniversalTime() - (Get-Date "1970-01-01")).TotalMilliseconds
$eventBody = @{
    title = "API Test Event - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    startDate = $tomorrow
    eventType = "conference"
    locationType = "virtual"
    description = "This event was created via the API test script"
    expectedAttendees = 100
    budget = 5000
}
$result = Invoke-Api -Method POST -Endpoint "/api/v1/events" -Body $eventBody -RequireAuth
if ($result.Success) {
    $eventId = $result.Data.data.eventId
    Write-Host "   ✓ Event Created!" -ForegroundColor Green
    Write-Host "   ✓ Event ID: $eventId" -ForegroundColor Green
    
    # Store for later tests
    $script:CreatedEventId = $eventId
} else {
    Write-Host "   ✗ Failed: $($result.Error.error.message)" -ForegroundColor Red
}
Write-Host ""

# ----------------------------------------------------------------------------
# Test 7: Get Event (Auth Required)
# ----------------------------------------------------------------------------
if ($script:CreatedEventId) {
    Write-Host "7. Testing Get Event (Auth Required)..." -ForegroundColor Green
    $result = Invoke-Api -Method GET -Endpoint "/api/v1/events/$($script:CreatedEventId)" -RequireAuth
    if ($result.Success) {
        Write-Host "   ✓ Event Title: $($result.Data.data.title)" -ForegroundColor Green
        Write-Host "   ✓ Event Status: $($result.Data.data.status)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Failed: $($result.Error.error.message)" -ForegroundColor Red
    }
    Write-Host ""
}

# ----------------------------------------------------------------------------
# Test 8: Update Event (Auth Required)
# ----------------------------------------------------------------------------
if ($script:CreatedEventId) {
    Write-Host "8. Testing Update Event (Auth Required)..." -ForegroundColor Green
    $updateBody = @{
        status = "planning"
        budget = 7500
    }
    $result = Invoke-Api -Method PATCH -Endpoint "/api/v1/events/$($script:CreatedEventId)" -Body $updateBody -RequireAuth
    if ($result.Success) {
        Write-Host "   ✓ Event Updated!" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Failed: $($result.Error.error.message)" -ForegroundColor Red
    }
    Write-Host ""
}

# ----------------------------------------------------------------------------
# Test 9: List Vendors (Auth Required)
# ----------------------------------------------------------------------------
Write-Host "9. Testing List Vendors (Auth Required)..." -ForegroundColor Green
$result = Invoke-Api -Method GET -Endpoint "/api/v1/vendors" -RequireAuth
if ($result.Success) {
    Write-Host "   ✓ Total Vendors: $($result.Data.meta.total)" -ForegroundColor Green
} else {
    Write-Host "   ✗ Failed: $($result.Error.error.message)" -ForegroundColor Red
}
Write-Host ""

# ----------------------------------------------------------------------------
# Test 10: List Sponsors (Auth Required)
# ----------------------------------------------------------------------------
Write-Host "10. Testing List Sponsors (Auth Required)..." -ForegroundColor Green
$result = Invoke-Api -Method GET -Endpoint "/api/v1/sponsors" -RequireAuth
if ($result.Success) {
    Write-Host "   ✓ Total Sponsors: $($result.Data.meta.total)" -ForegroundColor Green
} else {
    Write-Host "   ✗ Failed: $($result.Error.error.message)" -ForegroundColor Red
}
Write-Host ""

# ----------------------------------------------------------------------------
# Test 11: Delete Event (Auth Required)
# ----------------------------------------------------------------------------
if ($script:CreatedEventId) {
    Write-Host "11. Testing Delete Event (Auth Required)..." -ForegroundColor Green
    $result = Invoke-Api -Method DELETE -Endpoint "/api/v1/events/$($script:CreatedEventId)" -RequireAuth
    if ($result.Success) {
        Write-Host "   ✓ Event Deleted!" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Failed: $($result.Error.error.message)" -ForegroundColor Red
    }
    Write-Host ""
}

# ----------------------------------------------------------------------------
# Summary
# ----------------------------------------------------------------------------
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Test Complete!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your API is working correctly!" -ForegroundColor Green
Write-Host ""
Write-Host "API Base URL: $BaseUrl" -ForegroundColor Yellow
Write-Host ""
Write-Host "Available Endpoints:" -ForegroundColor Yellow
Write-Host "  GET    /api/v1/events           - List your events"
Write-Host "  POST   /api/v1/events           - Create event"
Write-Host "  GET    /api/v1/events/:id       - Get event"
Write-Host "  PATCH  /api/v1/events/:id       - Update event"
Write-Host "  DELETE /api/v1/events/:id       - Delete event"
Write-Host "  GET    /api/v1/vendors          - List vendors"
Write-Host "  GET    /api/v1/sponsors         - List sponsors"
Write-Host "  GET    /api/v1/public/events    - Public events (no auth)"
Write-Host "  GET    /api/v1/public/vendors   - Public vendors (no auth)"
Write-Host ""

