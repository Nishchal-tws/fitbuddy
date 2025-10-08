#!/usr/bin/env python3
"""
Integration test script for FitBuddy microservice architecture.
Tests both Flow 1 (Goal-Driven) and Flow 2 (Direct Selection).

Usage:
  python test_integration.py                    # Test with Docker services
  python test_integration.py --local            # Test with locally running services
"""

import asyncio
import httpx
import json
import time
import argparse
from typing import Dict, Any

# Parse command line arguments
parser = argparse.ArgumentParser(description='Test FitBuddy microservice integration')
parser.add_argument('--local', action='store_true', help='Test with locally running services')
args = parser.parse_args()

# Configuration based on environment
if args.local:
    FASTAPI_BASE_URL = "http://localhost:8000/api"
    SPRING_BOOT_BASE_URL = "http://localhost:8081/api/analytics"
    print("🧪 Testing with locally running services")
else:
    FASTAPI_BASE_URL = "http://localhost:8000/api"
    SPRING_BOOT_BASE_URL = "http://localhost:8081/api/analytics"
    print("🐳 Testing with Docker services")

class FitBuddyTester:
    def __init__(self):
        self.auth_token = None
        self.user_id = None
        
    async def setup_test_user(self) -> bool:
        """Create a test user and get auth token"""
        print("🔧 Setting up test user...")
        
        async with httpx.AsyncClient() as client:
            # Register test user
            user_data = {
                "email": "test@fitbuddy.com",
                "password": "testpassword123",
                "full_name": "Test User",
                "experience_level": "beginner"
            }
            
            try:
                response = await client.post(f"{FASTAPI_BASE_URL}/auth/register", json=user_data)
                if response.status_code == 201:
                    print("✅ Test user registered successfully")
                elif response.status_code == 400:
                    print("ℹ️  Test user already exists")
                else:
                    print(f"❌ Failed to register user: {response.status_code} - {response.text}")
                    return False
                
                # Login to get token
                login_data = {
                    "username": user_data["email"],
                    "password": user_data["password"]
                }
                
                response = await client.post(f"{FASTAPI_BASE_URL}/auth/login", data=login_data)
                if response.status_code == 200:
                    token_data = response.json()
                    self.auth_token = token_data["access_token"]
                    self.user_id = token_data.get("user_id")
                    print("✅ Login successful, got auth token")
                    return True
                else:
                    print(f"❌ Failed to login: {response.status_code} - {response.text}")
                    return False
                    
            except Exception as e:
                print(f"❌ Error setting up test user: {e}")
                return False
    
    async def test_flow_2_direct_selection(self) -> bool:
        """Test Flow 2: Direct Plan Selection"""
        print("\n🎯 Testing Flow 2: Direct Plan Selection")
        
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Step 1: Browse available plans
            print("📋 Step 1: Browsing available plans...")
            response = await client.get(f"{FASTAPI_BASE_URL}/plans/", headers=headers)
            
            if response.status_code == 200:
                plans = response.json()
                print(f"✅ Found {len(plans)} available plans")
                
                if plans:
                    # Display available plans
                    for plan in plans[:3]:  # Show first 3 plans
                        print(f"   - {plan['title']} ({plan.get('level', 'unknown')}) - {plan.get('duration_days', 'unknown')} days")
                    
                    # Step 2: Subscribe to a plan
                    plan_id = plans[0]['id']
                    print(f"\n📌 Step 2: Subscribing to plan '{plans[0]['title']}'...")
                    
                    response = await client.post(f"{FASTAPI_BASE_URL}/plans/subscribe/{plan_id}", headers=headers)
                    
                    if response.status_code == 201:
                        print("✅ Successfully subscribed to plan!")
                        
                        # Step 3: Check my plans
                        print("\n📋 Step 3: Checking my subscribed plans...")
                        response = await client.get(f"{FASTAPI_BASE_URL}/plans/my-plans", headers=headers)
                        
                        if response.status_code == 200:
                            my_plans = response.json()
                            print(f"✅ Found {len(my_plans)} subscribed plans")
                            return True
                        else:
                            print(f"❌ Failed to get my plans: {response.status_code}")
                            return False
                    else:
                        print(f"❌ Failed to subscribe to plan: {response.status_code} - {response.text}")
                        return False
                else:
                    print("❌ No plans available for testing")
                    return False
            else:
                print(f"❌ Failed to get plans: {response.status_code} - {response.text}")
                return False
    
    async def test_flow_1_goal_driven(self) -> bool:
        """Test Flow 1: Goal-Driven Plan Generation"""
        print("\n🎯 Testing Flow 1: Goal-Driven Plan Generation")
        
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Step 1: Create a goal
            print("🎯 Step 1: Creating a goal...")
            goal_data = {
                "title": "Lose 5kg in 2 months",
                "description": "I want to lose weight and get in better shape",
                "target_date": "2024-03-15",
                "is_completed": False
            }
            
            response = await client.post(f"{FASTAPI_BASE_URL}/goals/", json=goal_data, headers=headers)
            
            if response.status_code == 201:
                goal = response.json()
                goal_id = goal['id']
                print(f"✅ Goal created: '{goal['title']}' (ID: {goal_id})")
                
                # Step 2: Wait a moment for async processing
                print("⏳ Step 2: Waiting for plan generation...")
                await asyncio.sleep(3)
                
                # Step 3: Check if a custom plan was generated
                print("🔍 Step 3: Checking for generated custom plans...")
                response = await client.get(f"{FASTAPI_BASE_URL}/plans/my-plans", headers=headers)
                
                if response.status_code == 200:
                    my_plans = response.json()
                    
                    # Check if any of the plans are custom (have owner_id)
                    response = await client.get(f"{FASTAPI_BASE_URL}/plans/", headers=headers)
                    if response.status_code == 200:
                        all_plans = response.json()
                        custom_plans = [p for p in all_plans if p.get('owner_id') == self.user_id]
                        
                        if custom_plans:
                            print(f"✅ Found {len(custom_plans)} custom plan(s) generated!")
                            for plan in custom_plans:
                                print(f"   - {plan['title']} ({plan.get('level', 'unknown')}) - {plan.get('duration_days', 'unknown')} days")
                            return True
                        else:
                            print("⚠️  No custom plans found yet (may need more time or Spring Boot service)")
                            return False
                    else:
                        print(f"❌ Failed to get all plans: {response.status_code}")
                        return False
                else:
                    print(f"❌ Failed to get my plans: {response.status_code}")
                    return False
            else:
                print(f"❌ Failed to create goal: {response.status_code} - {response.text}")
                return False
    
    async def seed_system_plans(self) -> bool:
        """Seed system plans for testing"""
        print("\n🌱 Seeding system plans...")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{FASTAPI_BASE_URL}/admin/seed-plans")
            
            if response.status_code == 200:
                print("✅ System plans seeded successfully")
                return True
            else:
                print(f"❌ Failed to seed plans: {response.status_code} - {response.text}")
                return False
    
    async def check_spring_boot_health(self) -> bool:
        """Check if Spring Boot service is running"""
        print("\n🔍 Checking Spring Boot service health...")
        
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{SPRING_BOOT_BASE_URL}/system-plans")
                
                if response.status_code == 200:
                    plans = response.json()
                    print(f"✅ Spring Boot service is running (found {len(plans)} system plans)")
                    return True
                else:
                    print(f"⚠️  Spring Boot service responded with status {response.status_code}")
                    return False
                    
        except httpx.ConnectError:
            print("❌ Spring Boot service is not running or not accessible")
            return False
        except Exception as e:
            print(f"❌ Error checking Spring Boot service: {e}")
            return False
    
    async def run_full_test(self):
        """Run complete integration test"""
        print("🚀 Starting FitBuddy Integration Test")
        print("=" * 50)
        
        # Setup
        if not await self.setup_test_user():
            print("❌ Test setup failed")
            return
        
        # Check Spring Boot health
        spring_boot_healthy = await self.check_spring_boot_health()
        
        # Seed system plans
        if not await self.seed_system_plans():
            print("⚠️  Could not seed system plans, continuing with existing ones...")
        
        # Test Flow 2 (should work regardless of Spring Boot)
        flow2_success = await self.test_flow_2_direct_selection()
        
        # Test Flow 1 (requires Spring Boot)
        flow1_success = False
        if spring_boot_healthy:
            flow1_success = await self.test_flow_1_goal_driven()
        else:
            print("\n⚠️  Skipping Flow 1 test - Spring Boot service not available")
        
        # Results
        print("\n" + "=" * 50)
        print("📊 TEST RESULTS")
        print("=" * 50)
        print(f"Spring Boot Service: {'✅ Healthy' if spring_boot_healthy else '❌ Not Available'}")
        print(f"Flow 2 (Direct Selection): {'✅ Passed' if flow2_success else '❌ Failed'}")
        print(f"Flow 1 (Goal-Driven): {'✅ Passed' if flow1_success else '❌ Failed' if spring_boot_healthy else '⏭️  Skipped'}")
        
        if flow2_success and (flow1_success or not spring_boot_healthy):
            print("\n🎉 Integration test completed successfully!")
        else:
            print("\n⚠️  Some tests failed - check the logs above")

async def main():
    tester = FitBuddyTester()
    await tester.run_full_test()

if __name__ == "__main__":
    asyncio.run(main())
