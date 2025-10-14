#!/usr/bin/env python3
"""
Test script to verify RabbitMQ and Redis infrastructure setup
"""

import requests
import time
import sys

def test_api_health():
    """Test basic API health"""
    try:
        response = requests.get("http://localhost:8000/api/health", timeout=10)
        if response.status_code == 200:
            print("✅ API Health Check: PASSED")
            return True
        else:
            print(f"❌ API Health Check: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ API Health Check: FAILED ({e})")
        return False

def test_rabbitmq_health():
    """Test RabbitMQ connectivity"""
    try:
        response = requests.get("http://localhost:8000/api/health/rabbitmq", timeout=10)
        if response.status_code == 200:
            print("✅ RabbitMQ Health Check: PASSED")
            return True
        else:
            print(f"❌ RabbitMQ Health Check: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ RabbitMQ Health Check: FAILED ({e})")
        return False

def test_redis_health():
    """Test Redis connectivity"""
    try:
        response = requests.get("http://localhost:8000/api/health/redis", timeout=10)
        if response.status_code == 200:
            print("✅ Redis Health Check: PASSED")
            return True
        else:
            print(f"❌ Redis Health Check: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Redis Health Check: FAILED ({e})")
        return False

def test_infrastructure_health():
    """Test overall infrastructure health"""
    try:
        response = requests.get("http://localhost:8000/api/health/infrastructure", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Infrastructure Health Check: {data['status'].upper()}")
            for component, status in data['components'].items():
                print(f"   - {component}: {status}")
            return data['status'] == 'healthy'
        else:
            print(f"❌ Infrastructure Health Check: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Infrastructure Health Check: FAILED ({e})")
        return False

def test_rabbitmq_management():
    """Test RabbitMQ Management UI"""
    try:
        response = requests.get("http://localhost:15672", timeout=10)
        if response.status_code == 200:
            print("✅ RabbitMQ Management UI: ACCESSIBLE")
            return True
        else:
            print(f"❌ RabbitMQ Management UI: FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ RabbitMQ Management UI: FAILED ({e})")
        return False

def main():
    """Run all infrastructure tests"""
    print("🚀 Testing FitBuddy Infrastructure Setup")
    print("=" * 50)
    
    # Wait a moment for services to be ready
    print("⏳ Waiting for services to be ready...")
    time.sleep(5)
    
    tests = [
        ("API Health", test_api_health),
        ("RabbitMQ Health", test_rabbitmq_health),
        ("Redis Health", test_redis_health),
        ("Infrastructure Health", test_infrastructure_health),
        ("RabbitMQ Management UI", test_rabbitmq_management),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing {test_name}...")
        if test_func():
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All infrastructure tests passed! Phase 1 setup is complete.")
        print("\n📋 Next Steps:")
        print("   - RabbitMQ Management UI: http://localhost:15672 (fitbuddy/fitbuddy123)")
        print("   - API Documentation: http://localhost:8000/docs")
        print("   - Health Checks: http://localhost:8000/api/health/infrastructure")
        return 0
    else:
        print("❌ Some tests failed. Please check the infrastructure setup.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
