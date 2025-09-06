#!/usr/bin/env python3
"""
Evermore Backend API Test Suite
Tests all core API endpoints for the couples intimacy app
"""

import requests
import json
import time
from datetime import datetime, date

# Backend URL from frontend .env
BACKEND_URL = "https://bond-tree.preview.emergentagent.com/api"
DEMO_COUPLE_ID = "demo-couple-123"
TEST_EMAIL = "alice@evermore.com"
TEST_PARTNER_EMAIL = "bob@evermore.com"

class EvermoreAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "details": details
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
        
    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if "Evermore API" in data.get("message", ""):
                    self.log_test("API Root", True, "API root endpoint working correctly")
                    return True
                else:
                    self.log_test("API Root", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("API Root", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("API Root", False, f"Connection error: {str(e)}")
            return False
    
    def test_get_couple_data_new(self):
        """Test GET /couple-data/{couple_id} for new couple (should create default data)"""
        try:
            response = requests.get(f"{self.base_url}/couple-data/{DEMO_COUPLE_ID}")
            if response.status_code == 200:
                data = response.json()
                
                # Verify structure
                required_fields = ["progress", "tree_growth", "streak", "daily_ritual", "weekly_gesture", "monthly_big_gesture"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Get Couple Data (New)", False, f"Missing fields: {missing_fields}")
                    return False
                
                # Verify default values
                progress = data["progress"]
                if progress["communication"] != 0.0 or progress["intimacy"] != 0.0 or progress["trust"] != 0.0:
                    self.log_test("Get Couple Data (New)", False, f"Progress not initialized to 0: {progress}")
                    return False
                
                if data["tree_growth"] != 0.0 or data["streak"] != 0:
                    self.log_test("Get Couple Data (New)", False, f"Tree growth or streak not initialized to 0")
                    return False
                
                # Verify default activities exist
                daily_ritual = data["daily_ritual"]
                if not daily_ritual.get("title") or not daily_ritual.get("description"):
                    self.log_test("Get Couple Data (New)", False, "Daily ritual missing title or description")
                    return False
                
                self.log_test("Get Couple Data (New)", True, "Successfully created default couple data", data)
                return True
            else:
                self.log_test("Get Couple Data (New)", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get Couple Data (New)", False, f"Error: {str(e)}")
            return False
    
    def test_complete_daily_ritual(self):
        """Test completing daily ritual activity"""
        try:
            payload = {"activity_type": "dailyRitual"}
            response = requests.post(f"{self.base_url}/couple-data/{DEMO_COUPLE_ID}/complete-activity", 
                                   json=payload)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                if "new_progress" not in data or "tree_growth" not in data or "streak" not in data:
                    self.log_test("Complete Daily Ritual", False, "Missing fields in response")
                    return False
                
                # Verify progress increases (Communication: 0.5, Intimacy: 0.3, Trust: 0.2)
                progress = data["new_progress"]
                expected = {"communication": 0.5, "intimacy": 0.3, "trust": 0.2}
                
                for key, expected_val in expected.items():
                    if abs(progress[key] - expected_val) > 0.01:
                        self.log_test("Complete Daily Ritual", False, 
                                    f"Incorrect {key} progress: expected {expected_val}, got {progress[key]}")
                        return False
                
                # Verify tree growth increase (should be 3)
                if data["tree_growth"] != 3.0:
                    self.log_test("Complete Daily Ritual", False, 
                                f"Incorrect tree growth: expected 3.0, got {data['tree_growth']}")
                    return False
                
                # Verify streak increase (should be 1)
                if data["streak"] != 1:
                    self.log_test("Complete Daily Ritual", False, 
                                f"Incorrect streak: expected 1, got {data['streak']}")
                    return False
                
                self.log_test("Complete Daily Ritual", True, "Daily ritual completed successfully", data)
                return True
            else:
                self.log_test("Complete Daily Ritual", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Complete Daily Ritual", False, f"Error: {str(e)}")
            return False
    
    def test_complete_weekly_gesture(self):
        """Test completing weekly gesture activity"""
        try:
            payload = {"activity_type": "weeklyGesture"}
            response = requests.post(f"{self.base_url}/couple-data/{DEMO_COUPLE_ID}/complete-activity", 
                                   json=payload)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify progress increases (Communication: 1.0, Intimacy: 1.5, Trust: 1.0)
                progress = data["new_progress"]
                
                # Should be cumulative with previous daily ritual
                expected = {"communication": 1.5, "intimacy": 1.8, "trust": 1.2}
                
                for key, expected_val in expected.items():
                    if abs(progress[key] - expected_val) > 0.01:
                        self.log_test("Complete Weekly Gesture", False, 
                                    f"Incorrect {key} progress: expected {expected_val}, got {progress[key]}")
                        return False
                
                # Verify tree growth increase (should be 11 total: 3 + 8)
                if data["tree_growth"] != 11.0:
                    self.log_test("Complete Weekly Gesture", False, 
                                f"Incorrect tree growth: expected 11.0, got {data['tree_growth']}")
                    return False
                
                self.log_test("Complete Weekly Gesture", True, "Weekly gesture completed successfully", data)
                return True
            else:
                self.log_test("Complete Weekly Gesture", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Complete Weekly Gesture", False, f"Error: {str(e)}")
            return False
    
    def test_complete_monthly_big_gesture(self):
        """Test completing monthly big gesture activity"""
        try:
            payload = {"activity_type": "monthlyBigGesture"}
            response = requests.post(f"{self.base_url}/couple-data/{DEMO_COUPLE_ID}/complete-activity", 
                                   json=payload)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify progress increases (Communication: 2.0, Intimacy: 3.0, Trust: 2.5)
                progress = data["new_progress"]
                
                # Should be cumulative with previous activities
                expected = {"communication": 3.5, "intimacy": 4.8, "trust": 3.7}
                
                for key, expected_val in expected.items():
                    if abs(progress[key] - expected_val) > 0.01:
                        self.log_test("Complete Monthly Big Gesture", False, 
                                    f"Incorrect {key} progress: expected {expected_val}, got {progress[key]}")
                        return False
                
                # Verify tree growth increase (should be 26 total: 3 + 8 + 15)
                if data["tree_growth"] != 26.0:
                    self.log_test("Complete Monthly Big Gesture", False, 
                                f"Incorrect tree growth: expected 26.0, got {data['tree_growth']}")
                    return False
                
                self.log_test("Complete Monthly Big Gesture", True, "Monthly big gesture completed successfully", data)
                return True
            else:
                self.log_test("Complete Monthly Big Gesture", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Complete Monthly Big Gesture", False, f"Error: {str(e)}")
            return False
    
    def test_data_persistence(self):
        """Test that data persists between API calls"""
        try:
            response = requests.get(f"{self.base_url}/couple-data/{DEMO_COUPLE_ID}")
            if response.status_code == 200:
                data = response.json()
                
                # Verify cumulative progress from previous tests
                progress = data["progress"]
                expected = {"communication": 3.5, "intimacy": 4.8, "trust": 3.7}
                
                for key, expected_val in expected.items():
                    if abs(progress[key] - expected_val) > 0.01:
                        self.log_test("Data Persistence", False, 
                                    f"Progress not persisted for {key}: expected {expected_val}, got {progress[key]}")
                        return False
                
                # Verify tree growth persisted
                if data["tree_growth"] != 26.0:
                    self.log_test("Data Persistence", False, 
                                f"Tree growth not persisted: expected 26.0, got {data['tree_growth']}")
                    return False
                
                # Verify streak persisted
                if data["streak"] != 1:
                    self.log_test("Data Persistence", False, 
                                f"Streak not persisted: expected 1, got {data['streak']}")
                    return False
                
                self.log_test("Data Persistence", True, "Data persistence working correctly", data)
                return True
            else:
                self.log_test("Data Persistence", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Data Persistence", False, f"Error: {str(e)}")
            return False
    
    def test_create_couple_account(self):
        """Test creating a new couple account"""
        try:
            payload = {
                "email": TEST_EMAIL,
                "partner_email": TEST_PARTNER_EMAIL
            }
            response = requests.post(f"{self.base_url}/couples", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                if "email" not in data or "couple_id" not in data:
                    self.log_test("Create Couple Account", False, "Missing fields in response")
                    return False
                
                if data["email"] != TEST_EMAIL:
                    self.log_test("Create Couple Account", False, f"Email mismatch: {data['email']}")
                    return False
                
                if not data.get("couple_id"):
                    self.log_test("Create Couple Account", False, "Couple ID not generated")
                    return False
                
                self.log_test("Create Couple Account", True, "Couple account created successfully", data)
                return True
            else:
                self.log_test("Create Couple Account", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Create Couple Account", False, f"Error: {str(e)}")
            return False
    
    def test_get_user_info(self):
        """Test getting user information by email"""
        try:
            response = requests.get(f"{self.base_url}/couples/{TEST_EMAIL}")
            
            if response.status_code == 200:
                data = response.json()
                
                if data["email"] != TEST_EMAIL:
                    self.log_test("Get User Info", False, f"Email mismatch: {data['email']}")
                    return False
                
                if not data.get("couple_id"):
                    self.log_test("Get User Info", False, "Couple ID missing")
                    return False
                
                self.log_test("Get User Info", True, "User info retrieved successfully", data)
                return True
            else:
                self.log_test("Get User Info", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Get User Info", False, f"Error: {str(e)}")
            return False
    
    def test_invalid_activity_type(self):
        """Test edge case: invalid activity type"""
        try:
            payload = {"activity_type": "invalidActivity"}
            response = requests.post(f"{self.base_url}/couple-data/{DEMO_COUPLE_ID}/complete-activity", 
                                   json=payload)
            
            if response.status_code == 400:
                self.log_test("Invalid Activity Type", True, "Correctly rejected invalid activity type")
                return True
            else:
                self.log_test("Invalid Activity Type", False, 
                            f"Should return 400 for invalid activity, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Invalid Activity Type", False, f"Error: {str(e)}")
            return False
    
    def test_nonexistent_couple_activity(self):
        """Test edge case: completing activity for non-existent couple"""
        try:
            payload = {"activity_type": "dailyRitual"}
            response = requests.post(f"{self.base_url}/couple-data/nonexistent-couple/complete-activity", 
                                   json=payload)
            
            if response.status_code == 404:
                self.log_test("Nonexistent Couple Activity", True, "Correctly returned 404 for nonexistent couple")
                return True
            else:
                self.log_test("Nonexistent Couple Activity", False, 
                            f"Should return 404 for nonexistent couple, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Nonexistent Couple Activity", False, f"Error: {str(e)}")
            return False
    
    def test_progress_caps(self):
        """Test that progress caps at 100%"""
        try:
            # Complete multiple monthly big gestures to test caps
            for i in range(35):  # Should exceed 100% for all categories
                payload = {"activity_type": "monthlyBigGesture"}
                response = requests.post(f"{self.base_url}/couple-data/{DEMO_COUPLE_ID}/complete-activity", 
                                       json=payload)
                if response.status_code != 200:
                    self.log_test("Progress Caps", False, f"Failed on iteration {i}: {response.status_code}")
                    return False
            
            # Check final values
            response = requests.get(f"{self.base_url}/couple-data/{DEMO_COUPLE_ID}")
            if response.status_code == 200:
                data = response.json()
                progress = data["progress"]
                
                # All progress should be capped at 100
                for key, value in progress.items():
                    if value > 100:
                        self.log_test("Progress Caps", False, f"{key} exceeded 100%: {value}")
                        return False
                
                # Tree growth should also be capped at 100
                if data["tree_growth"] > 100:
                    self.log_test("Progress Caps", False, f"Tree growth exceeded 100%: {data['tree_growth']}")
                    return False
                
                self.log_test("Progress Caps", True, "Progress and tree growth properly capped at 100%")
                return True
            else:
                self.log_test("Progress Caps", False, f"Failed to get data: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Progress Caps", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🌳 Starting Evermore Backend API Tests")
        print("=" * 50)
        
        tests = [
            self.test_api_root,
            self.test_get_couple_data_new,
            self.test_complete_daily_ritual,
            self.test_complete_weekly_gesture,
            self.test_complete_monthly_big_gesture,
            self.test_data_persistence,
            self.test_create_couple_account,
            self.test_get_user_info,
            self.test_invalid_activity_type,
            self.test_nonexistent_couple_activity,
            self.test_progress_caps
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL: {test.__name__} - Unexpected error: {str(e)}")
                failed += 1
            
            time.sleep(0.5)  # Small delay between tests
        
        print("\n" + "=" * 50)
        print(f"🌳 Evermore Backend Test Results")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        return passed, failed, self.test_results

if __name__ == "__main__":
    tester = EvermoreAPITester()
    passed, failed, results = tester.run_all_tests()
    
    # Save detailed results
    with open("/app/backend_test_results.json", "w") as f:
        json.dump({
            "summary": {"passed": passed, "failed": failed},
            "tests": results,
            "backend_url": BACKEND_URL,
            "demo_couple_id": DEMO_COUPLE_ID
        }, f, indent=2)
    
    print(f"\n📄 Detailed results saved to /app/backend_test_results.json")