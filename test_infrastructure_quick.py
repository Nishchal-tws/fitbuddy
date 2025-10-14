#!/usr/bin/env python3
"""
Quick infrastructure test script for Phase 3
Tests only the infrastructure components that don't require authentication
"""

import requests
import time
import sys

def test_infrastructure_only():
    """Test only infrastructure components that don't require auth"""
    print("🚀 Testing FitBuddy Phase 3: Infrastructure Only")
    print("=" * 60)
    
    # Wait for services to be ready
    print("⏳ Waiting for services to be ready...")
    time.sleep(5)
    
    tests_passed = 0
    total_tests = 0
    
    # Test infrastructure health
    print("\n🔍 Testing Infrastructure Health...")
    total_tests += 1
    try:
        response = requests.get("http://localhost:8000/api/health/infrastructure", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✅ Infrastructure Health Check: PASSED")
            print(f"   Status: {data.get('status', 'unknown')}")
            tests_passed += 1
        else:
            print(f"❌ Infrastructure Health Check: FAILED (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ Infrastructure Health Check: FAILED ({e})")
    
    # Test RabbitMQ health
    print("\n🔍 Testing RabbitMQ Health...")
    total_tests += 1
    try:
        response = requests.get("http://localhost:8000/api/health/rabbitmq", timeout=10)
        if response.status_code == 200:
            print("✅ RabbitMQ Health Check: PASSED")
            tests_passed += 1
        else:
            print(f"❌ RabbitMQ Health Check: FAILED (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ RabbitMQ Health Check: FAILED ({e})")
    
    # Test Redis health
    print("\n🔍 Testing Redis Health...")
    total_tests += 1
    try:
        response = requests.get("http://localhost:8000/api/health/redis", timeout=10)
        if response.status_code == 200:
            print("✅ Redis Health Check: PASSED")
            tests_passed += 1
        else:
            print(f"❌ Redis Health Check: FAILED (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ Redis Health Check: FAILED ({e})")
    
    # Test database health
    print("\n🔍 Testing Database Health...")
    total_tests += 1
    try:
        response = requests.get("http://localhost:8000/api/health/database", timeout=10)
        if response.status_code == 200:
            print("✅ Database Health Check: PASSED")
            tests_passed += 1
        else:
            print(f"❌ Database Health Check: FAILED (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ Database Health Check: FAILED ({e})")
    
    # Test API documentation
    print("\n🔍 Testing API Documentation...")
    total_tests += 1
    try:
        response = requests.get("http://localhost:8000/docs", timeout=10)
        if response.status_code == 200:
            print("✅ API Documentation: ACCESSIBLE")
            tests_passed += 1
        else:
            print(f"❌ API Documentation: FAILED (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ API Documentation: FAILED ({e})")
    
    # Test basic API health
    print("\n🔍 Testing Basic API Health...")
    total_tests += 1
    try:
        response = requests.get("http://localhost:8000/api/health", timeout=10)
        if response.status_code == 200:
            print("✅ Basic API Health Check: PASSED")
            tests_passed += 1
        else:
            print(f"❌ Basic API Health Check: FAILED (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ Basic API Health Check: FAILED ({e})")
    
    print("\n" + "=" * 60)
    print(f"📊 Infrastructure Test Results: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed == total_tests:
        print("🎉 All infrastructure tests passed!")
        print("\n✅ Infrastructure Components Ready:")
        print("   - FastAPI Backend (Port 8000)")
        print("   - Spring Boot Analytics (Port 8081)")
        print("   - RabbitMQ Message Broker (Port 5672)")
        print("   - Redis Cache (Port 6379)")
        print("   - PostgreSQL Database (Port 5432)")
        print("   - Celery Workers (Background)")
        print("   - Celery Beat Scheduler (Background)")
        
        print("\n📊 Access Points:")
        print("   - API Documentation: http://localhost:8000/docs")
        print("   - RabbitMQ Management: http://localhost:15672 (fitbuddy/fitbuddy123)")
        print("   - Health Checks: http://localhost:8000/api/health/infrastructure")
        
        print("\n🚀 Ready to run full Phase 3 tests with authentication!")
        print("   Run: python test_phase3.py")
        
        return 0
    else:
        print("❌ Some infrastructure tests failed. Please check the services.")
        print("\n🔧 Troubleshooting:")
        print("   1. Make sure all services are running: docker-compose up --build")
        print("   2. Check service logs: docker-compose logs")
        print("   3. Verify all containers are healthy: docker-compose ps")
        return 1

if __name__ == "__main__":
    sys.exit(test_infrastructure_only())
