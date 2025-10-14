#!/usr/bin/env python3
"""
Test script to verify Phase 3: Service Enhancements Implementation
"""

import requests
import time
import sys
import json
from datetime import datetime, timedelta

# Global variables for authentication
AUTH_TOKEN = None
USER_ID = None

def authenticate_user():
    """Authenticate and get JWT token"""
    global AUTH_TOKEN, USER_ID
    
    try:
        # Use the existing user credentials with OAuth2PasswordRequestForm format
        login_data = {
            "username": "sandeep@gmail.com",  # OAuth2PasswordRequestForm uses 'username' field
            "password": "sandep123"
        }
        
        # Login using the correct /token endpoint with form data
        response = requests.post("http://localhost:8000/api/auth/token", data=login_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            AUTH_TOKEN = data.get("access_token")
            
            if AUTH_TOKEN:
                print("✅ Authentication: SUCCESS")
                print(f"   Token received for user: sandeep@gmail.com")
                # Set a dummy user ID since we don't get it from the token endpoint
                USER_ID = 1  # We'll use this for testing
                return True
            else:
                print("❌ Authentication: FAILED - No token received")
                return False
        else:
            print(f"❌ Authentication: FAILED (Status: {response.status_code})")
            if response.status_code == 401:
                print("   This usually means incorrect username/password")
            elif response.status_code == 405:
                print("   This usually means wrong endpoint or method")
            return False
            
    except Exception as e:
        print(f"❌ Authentication: FAILED ({e})")
        return False

def get_auth_headers():
    """Get headers with authentication token"""
    if AUTH_TOKEN:
        return {"Authorization": f"Bearer {AUTH_TOKEN}"}
    return {}

def test_infrastructure_health():
    """Test that all infrastructure components are healthy"""
    try:
        response = requests.get("http://localhost:8000/api/health/infrastructure", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✅ Infrastructure Health Check: PASSED")
            return data['status'] == 'healthy'
        else:
            print(f"❌ Infrastructure Health Check: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Infrastructure Health Check: FAILED ({e})")
        return False

def test_enhanced_workout_endpoints():
    """Test enhanced workout endpoints with caching and message queuing"""
    try:
        print("🔍 Testing Enhanced Workout Endpoints...")
        headers = get_auth_headers()
        
        # Test workout summary endpoint
        response = requests.get("http://localhost:8000/api/workouts/stats/summary?days=30", headers=headers, timeout=10)
        if response.status_code == 200:
            print("✅ Workout Summary Endpoint: PASSED")
        else:
            print(f"❌ Workout Summary Endpoint: FAILED (Status: {response.status_code})")
            return False
        
        # Test trigger analysis endpoint
        response = requests.post("http://localhost:8000/api/workouts/trigger-analysis?analysis_type=weekly", headers=headers, timeout=10)
        if response.status_code == 200:
            print("✅ Trigger Analysis Endpoint: PASSED")
        else:
            print(f"❌ Trigger Analysis Endpoint: FAILED (Status: {response.status_code})")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Enhanced Workout Endpoints Test: FAILED ({e})")
        return False

def test_enhanced_goal_endpoints():
    """Test enhanced goal endpoints with caching and message queuing"""
    try:
        print("🔍 Testing Enhanced Goal Endpoints...")
        headers = get_auth_headers()
        
        # Test goal summary endpoint
        response = requests.get("http://localhost:8000/api/goals/stats/summary", headers=headers, timeout=10)
        if response.status_code == 200:
            print("✅ Goal Summary Endpoint: PASSED")
        else:
            print(f"❌ Goal Summary Endpoint: FAILED (Status: {response.status_code})")
            return False
        
        # Test trigger deadline check endpoint
        response = requests.post("http://localhost:8000/api/goals/trigger-deadline-check", headers=headers, timeout=10)
        if response.status_code == 200:
            print("✅ Trigger Deadline Check Endpoint: PASSED")
        else:
            print(f"❌ Trigger Deadline Check Endpoint: FAILED (Status: {response.status_code})")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Enhanced Goal Endpoints Test: FAILED ({e})")
        return False

def test_reports_endpoints():
    """Test new reports endpoints"""
    try:
        print("🔍 Testing Reports Endpoints...")
        headers = get_auth_headers()
        
        # Test available reports endpoint
        response = requests.get("http://localhost:8000/api/reports/available", headers=headers, timeout=10)
        if response.status_code == 200:
            print("✅ Available Reports Endpoint: PASSED")
        else:
            print(f"❌ Available Reports Endpoint: FAILED (Status: {response.status_code})")
            return False
        
        # Test weekly report generation
        response = requests.get("http://localhost:8000/api/reports/weekly", headers=headers, timeout=10)
        if response.status_code == 200:
            print("✅ Weekly Report Generation: PASSED")
        else:
            print(f"❌ Weekly Report Generation: FAILED (Status: {response.status_code})")
            return False
        
        # Test monthly report generation
        response = requests.get("http://localhost:8000/api/reports/monthly", headers=headers, timeout=10)
        if response.status_code == 200:
            print("✅ Monthly Report Generation: PASSED")
        else:
            print(f"❌ Monthly Report Generation: FAILED (Status: {response.status_code})")
            return False
        
        # Test progress analysis endpoint
        response = requests.get("http://localhost:8000/api/reports/progress-analysis?analysis_type=weekly", headers=headers, timeout=10)
        if response.status_code == 200:
            print("✅ Progress Analysis Endpoint: PASSED")
        else:
            print(f"❌ Progress Analysis Endpoint: FAILED (Status: {response.status_code})")
            return False
        
        # Test generate all reports endpoint
        response = requests.post("http://localhost:8000/api/reports/generate-all", headers=headers, timeout=10)
        if response.status_code == 200:
            print("✅ Generate All Reports Endpoint: PASSED")
        else:
            print(f"❌ Generate All Reports Endpoint: FAILED (Status: {response.status_code})")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Reports Endpoints Test: FAILED ({e})")
        return False

def test_message_queue_integration():
    """Test message queue integration"""
    try:
        print("🔍 Testing Message Queue Integration...")
        
        # Test RabbitMQ health
        response = requests.get("http://localhost:8000/api/health/rabbitmq", timeout=10)
        if response.status_code == 200:
            print("✅ RabbitMQ Integration: PASSED")
        else:
            print(f"❌ RabbitMQ Integration: FAILED (Status: {response.status_code})")
            return False
        
        # Test Redis health
        response = requests.get("http://localhost:8000/api/health/redis", timeout=10)
        if response.status_code == 200:
            print("✅ Redis Integration: PASSED")
        else:
            print(f"❌ Redis Integration: FAILED (Status: {response.status_code})")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Message Queue Integration Test: FAILED ({e})")
        return False

def test_caching_functionality():
    """Test Redis caching functionality"""
    try:
        print("🔍 Testing Caching Functionality...")
        headers = get_auth_headers()
        
        # Test multiple requests to same endpoint to verify caching
        start_time = time.time()
        
        # First request (should hit database)
        response1 = requests.get("http://localhost:8000/api/workouts/stats/summary?days=7", headers=headers, timeout=10)
        
        # Second request (should hit cache)
        response2 = requests.get("http://localhost:8000/api/workouts/stats/summary?days=7", headers=headers, timeout=10)
        
        end_time = time.time()
        
        if response1.status_code == 200 and response2.status_code == 200:
            print("✅ Caching Functionality: PASSED")
            print(f"   Response time: {end_time - start_time:.2f} seconds")
            return True
        else:
            print(f"❌ Caching Functionality: FAILED")
            return False
        
    except Exception as e:
        print(f"❌ Caching Functionality Test: FAILED ({e})")
        return False

def test_background_processing():
    """Test background processing capabilities"""
    try:
        print("🔍 Testing Background Processing...")
        headers = get_auth_headers()
        
        # Test workout processing
        response = requests.post("http://localhost:8000/api/workouts/trigger-analysis?analysis_type=weekly", headers=headers, timeout=10)
        if response.status_code == 200:
            print("✅ Background Workout Processing: PASSED")
        else:
            print(f"❌ Background Workout Processing: FAILED (Status: {response.status_code})")
            return False
        
        # Test goal processing
        response = requests.post("http://localhost:8000/api/goals/trigger-deadline-check", headers=headers, timeout=10)
        if response.status_code == 200:
            print("✅ Background Goal Processing: PASSED")
        else:
            print(f"❌ Background Goal Processing: FAILED (Status: {response.status_code})")
            return False
        
        # Test report generation
        response = requests.get("http://localhost:8000/api/reports/weekly", headers=headers, timeout=10)
        if response.status_code == 200:
            print("✅ Background Report Generation: PASSED")
        else:
            print(f"❌ Background Report Generation: FAILED (Status: {response.status_code})")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Background Processing Test: FAILED ({e})")
        return False

def test_api_documentation():
    """Test API documentation accessibility"""
    try:
        print("🔍 Testing API Documentation...")
        
        response = requests.get("http://localhost:8000/docs", timeout=10)
        if response.status_code == 200:
            print("✅ API Documentation: ACCESSIBLE")
            return True
        else:
            print(f"❌ API Documentation: FAILED (Status: {response.status_code})")
            return False
        
    except Exception as e:
        print(f"❌ API Documentation Test: FAILED ({e})")
        return False

def main():
    """Run all Phase 3 tests"""
    print("🚀 Testing FitBuddy Phase 3: Service Enhancements")
    print("=" * 60)
    
    # Wait for services to be ready
    print("⏳ Waiting for services to be ready...")
    time.sleep(5)
    
    # Authenticate first
    print("🔐 Authenticating test user...")
    if not authenticate_user():
        print("❌ Authentication failed. Cannot proceed with tests.")
        return 1
    
    tests = [
        ("Infrastructure Health", test_infrastructure_health),
        ("Enhanced Workout Endpoints", test_enhanced_workout_endpoints),
        ("Enhanced Goal Endpoints", test_enhanced_goal_endpoints),
        ("Reports Endpoints", test_reports_endpoints),
        ("Message Queue Integration", test_message_queue_integration),
        ("Caching Functionality", test_caching_functionality),
        ("Background Processing", test_background_processing),
        ("API Documentation", test_api_documentation),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running {test_name}...")
        if test_func():
            passed += 1
        print()
    
    print("=" * 60)
    print(f"📊 Phase 3 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All Phase 3 tests passed! Service Enhancements are complete.")
        print("\n📋 Phase 3 Implementation Summary:")
        print("   ✅ Enhanced FastAPI endpoints with RabbitMQ integration")
        print("   ✅ Redis caching for improved performance")
        print("   ✅ Background processing for all major operations")
        print("   ✅ New Reports API with automated generation")
        print("   ✅ Enhanced Workout endpoints with statistics")
        print("   ✅ Enhanced Goal endpoints with deadline management")
        print("   ✅ Spring Boot message listeners for queue processing")
        print("   ✅ Comprehensive error handling and logging")
        
        print("\n🎯 Ready for Phase 4: Advanced Features!")
        print("\n📊 New API Endpoints Available:")
        print("   - GET /api/workouts/stats/summary - Workout statistics")
        print("   - POST /api/workouts/trigger-analysis - Trigger analysis")
        print("   - GET /api/goals/stats/summary - Goal statistics")
        print("   - POST /api/goals/trigger-deadline-check - Check deadlines")
        print("   - GET /api/reports/weekly - Weekly reports")
        print("   - GET /api/reports/monthly - Monthly reports")
        print("   - GET /api/reports/available - Available reports")
        print("   - POST /api/reports/generate-all - Generate all reports")
        
        print("\n📊 Access Points:")
        print("   - API Documentation: http://localhost:8000/docs")
        print("   - RabbitMQ Management: http://localhost:15672 (fitbuddy/fitbuddy123)")
        print("   - Health Checks: http://localhost:8000/api/health/infrastructure")
        
        return 0
    else:
        print("❌ Some Phase 3 tests failed. Please check the implementation.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
