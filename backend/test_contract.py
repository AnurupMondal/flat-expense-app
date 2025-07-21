#!/usr/bin/env python3
"""
Contract testing script using Schemathesis to validate API endpoints
against the OpenAPI specification.
"""

import schemathesis
import requests
import json
import os
import sys
from typing import Dict, Any

# Configuration
API_BASE_URL = "http://localhost:3001/api"
OPENAPI_SPEC_PATH = "./openapi.yaml"

# Test user credentials for authentication
TEST_USER = {
    "email": "test@example.com",
    "password": "testpassword123",
    "name": "Test User"
}

ADMIN_USER = {
    "email": "admin@example.com", 
    "password": "adminpassword123",
    "name": "Admin User"
}

def get_auth_token(user_data: Dict[str, Any]) -> str:
    """Get authentication token for a user."""
    login_url = f"{API_BASE_URL}/auth/login"
    
    # Try to login, if fails try to register first
    login_response = requests.post(login_url, json={
        "email": user_data["email"],
        "password": user_data["password"]
    })
    
    if login_response.status_code == 401:
        # User doesn't exist, register first
        register_url = f"{API_BASE_URL}/auth/register"
        register_response = requests.post(register_url, json=user_data)
        
        if register_response.status_code == 201:
            print(f"Registered user: {user_data['email']}")
            # Try login again after registration
            login_response = requests.post(login_url, json={
                "email": user_data["email"],
                "password": user_data["password"]
            })
    
    if login_response.status_code == 200:
        token = login_response.json().get("data", {}).get("token")
        if token:
            return token
        else:
            print("No token in response")
    else:
        print(f"Login failed with status {login_response.status_code}: {login_response.text}")
    
    return ""

def setup_auth_headers() -> Dict[str, str]:
    """Setup authentication headers for testing."""
    token = get_auth_token(TEST_USER)
    if not token:
        print("Failed to get authentication token, proceeding without auth")
        return {}
    
    return {"Authorization": f"Bearer {token}"}

def check_server_health():
    """Check if the server is running."""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✓ Server is running and healthy")
            return True
        else:
            print(f"✗ Server health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Cannot connect to server: {e}")
        return False

def run_contract_tests():
    """Run contract tests using Schemathesis."""
    if not check_server_health():
        print("Server is not available. Please start the server first.")
        return False

    print(f"Loading OpenAPI spec from: {OPENAPI_SPEC_PATH}")
    
    try:
        # Load the schema
        schema = schemathesis.from_path(OPENAPI_SPEC_PATH, base_url=API_BASE_URL)
        
        print("Starting contract tests...")
        
        # Setup authentication
        auth_headers = setup_auth_headers()
        
        # Test results
        results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
        
        # Run tests for each endpoint
        for case in schema.get_all_tests():
            try:
                # Skip authentication endpoints for now as they need special handling
                if "/auth/" in case.path:
                    continue
                    
                print(f"Testing {case.method.upper()} {case.path}")
                
                # Add auth headers if available
                if auth_headers and case.method.upper() != "GET" or "health" not in case.path:
                    case.headers.update(auth_headers)
                
                # Execute the test case
                response = case.call()
                
                # Basic validation
                if response.status_code < 500:  # Not a server error
                    results["passed"] += 1
                    print(f"  ✓ {response.status_code}")
                else:
                    results["failed"] += 1
                    results["errors"].append(f"{case.method} {case.path}: {response.status_code}")
                    print(f"  ✗ {response.status_code}")
                
            except Exception as e:
                results["failed"] += 1
                results["errors"].append(f"{case.method} {case.path}: {str(e)}")
                print(f"  ✗ Error: {e}")
        
        # Print summary
        print(f"\nTest Summary:")
        print(f"✓ Passed: {results['passed']}")
        print(f"✗ Failed: {results['failed']}")
        
        if results["errors"]:
            print(f"\nErrors:")
            for error in results["errors"]:
                print(f"  - {error}")
        
        return results["failed"] == 0
        
    except Exception as e:
        print(f"Failed to run contract tests: {e}")
        return False

def validate_openapi_spec():
    """Validate the OpenAPI specification itself."""
    print("Validating OpenAPI specification...")
    
    try:
        schema = schemathesis.from_path(OPENAPI_SPEC_PATH)
        print("✓ OpenAPI specification is valid")
        return True
    except Exception as e:
        print(f"✗ OpenAPI specification is invalid: {e}")
        return False

if __name__ == "__main__":
    print("=== API Contract Testing ===")
    
    # Validate the OpenAPI spec first
    if not validate_openapi_spec():
        sys.exit(1)
    
    # Run contract tests
    if not run_contract_tests():
        print("\n❌ Contract tests failed")
        sys.exit(1)
    else:
        print("\n✅ All contract tests passed")
        sys.exit(0)
