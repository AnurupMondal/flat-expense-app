#!/usr/bin/env python3
"""
Test Metrics Analysis Script for Flat Expense Management System
This script analyzes the test-matrix.csv file and generates comprehensive metrics
"""

import csv
import sys
from collections import defaultdict, Counter
from datetime import datetime
import os

class TestMetricsAnalyzer:
    def __init__(self, csv_file='test-matrix.csv'):
        self.csv_file = csv_file
        self.test_data = []
        self.metrics = {}
        
    def load_test_data(self):
        """Load test data from CSV file"""
        try:
            with open(self.csv_file, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                self.test_data = list(reader)
                print(f"✅ Loaded {len(self.test_data)} test cases from {self.csv_file}")
        except FileNotFoundError:
            print(f"❌ Error: {self.csv_file} not found!")
            sys.exit(1)
        except Exception as e:
            print(f"❌ Error loading CSV: {e}")
            sys.exit(1)
    
    def calculate_basic_metrics(self):
        """Calculate basic test metrics"""
        total_tests = len(self.test_data)
        
        # Status distribution
        status_counts = Counter(test['Status'] for test in self.test_data if test['Status'])
        
        # Priority distribution
        priority_counts = Counter(test['Priority'] for test in self.test_data)
        
        # Calculate pass rate
        passed_tests = status_counts.get('Pass', 0)
        failed_tests = status_counts.get('Fail', 0)
        executed_tests = passed_tests + failed_tests
        
        pass_rate = (passed_tests / executed_tests * 100) if executed_tests > 0 else 0
        
        self.metrics['basic'] = {
            'total_tests': total_tests,
            'executed_tests': executed_tests,
            'passed_tests': passed_tests,
            'failed_tests': failed_tests,
            'blocked_tests': status_counts.get('Blocked', 0),
            'skipped_tests': status_counts.get('Skipped', 0),
            'in_progress_tests': status_counts.get('In Progress', 0),
            'not_executed': total_tests - executed_tests - status_counts.get('Blocked', 0) - status_counts.get('Skipped', 0) - status_counts.get('In Progress', 0),
            'pass_rate': round(pass_rate, 2),
            'priority_counts': dict(priority_counts)
        }
    
    def calculate_feature_coverage(self):
        """Calculate coverage by feature"""
        feature_stats = defaultdict(lambda: {'total': 0, 'pass': 0, 'fail': 0, 'executed': 0})
        
        for test in self.test_data:
            feature = test['Feature']
            status = test['Status']
            
            feature_stats[feature]['total'] += 1
            
            if status == 'Pass':
                feature_stats[feature]['pass'] += 1
                feature_stats[feature]['executed'] += 1
            elif status == 'Fail':
                feature_stats[feature]['fail'] += 1
                feature_stats[feature]['executed'] += 1
        
        # Calculate pass rates for each feature
        for feature in feature_stats:
            executed = feature_stats[feature]['executed']
            if executed > 0:
                feature_stats[feature]['pass_rate'] = round(
                    (feature_stats[feature]['pass'] / executed) * 100, 2
                )
            else:
                feature_stats[feature]['pass_rate'] = 0
        
        self.metrics['features'] = dict(feature_stats)
    
    def calculate_role_coverage(self):
        """Calculate coverage by user role"""
        role_stats = defaultdict(lambda: {'total': 0, 'pass': 0, 'fail': 0, 'executed': 0})
        
        for test in self.test_data:
            role = test['Role']
            status = test['Status']
            
            role_stats[role]['total'] += 1
            
            if status == 'Pass':
                role_stats[role]['pass'] += 1
                role_stats[role]['executed'] += 1
            elif status == 'Fail':
                role_stats[role]['fail'] += 1
                role_stats[role]['executed'] += 1
        
        # Calculate pass rates for each role
        for role in role_stats:
            executed = role_stats[role]['executed']
            if executed > 0:
                role_stats[role]['pass_rate'] = round(
                    (role_stats[role]['pass'] / executed) * 100, 2
                )
            else:
                role_stats[role]['pass_rate'] = 0
        
        self.metrics['roles'] = dict(role_stats)
    
    def calculate_device_coverage(self):
        """Calculate coverage by device size"""
        device_stats = defaultdict(lambda: {'total': 0, 'pass': 0, 'fail': 0, 'executed': 0})
        
        for test in self.test_data:
            device = test['Device Size']
            status = test['Status']
            
            device_stats[device]['total'] += 1
            
            if status == 'Pass':
                device_stats[device]['pass'] += 1
                device_stats[device]['executed'] += 1
            elif status == 'Fail':
                device_stats[device]['fail'] += 1
                device_stats[device]['executed'] += 1
        
        # Calculate pass rates for each device
        for device in device_stats:
            executed = device_stats[device]['executed']
            if executed > 0:
                device_stats[device]['pass_rate'] = round(
                    (device_stats[device]['pass'] / executed) * 100, 2
                )
            else:
                device_stats[device]['pass_rate'] = 0
        
        self.metrics['devices'] = dict(device_stats)
    
    def calculate_priority_metrics(self):
        """Calculate metrics by priority level"""
        priority_stats = defaultdict(lambda: {'total': 0, 'pass': 0, 'fail': 0, 'executed': 0, 'critical_failures': []})
        
        for test in self.test_data:
            priority = test['Priority']
            status = test['Status']
            
            priority_stats[priority]['total'] += 1
            
            if status == 'Pass':
                priority_stats[priority]['pass'] += 1
                priority_stats[priority]['executed'] += 1
            elif status == 'Fail':
                priority_stats[priority]['fail'] += 1
                priority_stats[priority]['executed'] += 1
                
                # Track P0 failures as critical
                if priority == 'P0':
                    priority_stats[priority]['critical_failures'].append({
                        'feature': test['Feature'],
                        'description': test['Test Case Description'],
                        'ticket': test['Ticket Link']
                    })
        
        # Calculate pass rates for each priority
        for priority in priority_stats:
            executed = priority_stats[priority]['executed']
            if executed > 0:
                priority_stats[priority]['pass_rate'] = round(
                    (priority_stats[priority]['pass'] / executed) * 100, 2
                )
            else:
                priority_stats[priority]['pass_rate'] = 0
        
        self.metrics['priorities'] = dict(priority_stats)
    
    def generate_report(self):
        """Generate comprehensive test metrics report"""
        report = []
        report.append("=" * 80)
        report.append("TEST METRICS REPORT - FLAT EXPENSE MANAGEMENT SYSTEM")
        report.append("=" * 80)
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append(f"Data Source: {self.csv_file}")
        report.append("")
        
        # Basic Metrics
        basic = self.metrics['basic']
        report.append("📊 OVERALL TEST EXECUTION SUMMARY")
        report.append("-" * 40)
        report.append(f"Total Test Cases: {basic['total_tests']}")
        report.append(f"Executed Tests: {basic['executed_tests']}")
        report.append(f"Not Executed: {basic['not_executed']}")
        report.append(f"Pass Rate: {basic['pass_rate']}%")
        report.append("")
        report.append("Test Results Breakdown:")
        report.append(f"  ✅ Passed: {basic['passed_tests']}")
        report.append(f"  ❌ Failed: {basic['failed_tests']}")
        report.append(f"  🚫 Blocked: {basic['blocked_tests']}")
        report.append(f"  ⏸️  Skipped: {basic['skipped_tests']}")
        report.append(f"  🔄 In Progress: {basic['in_progress_tests']}")
        report.append("")
        
        # Priority Distribution
        report.append("🎯 PRIORITY DISTRIBUTION")
        report.append("-" * 40)
        for priority, count in basic['priority_counts'].items():
            percentage = (count / basic['total_tests']) * 100
            report.append(f"{priority}: {count} tests ({percentage:.1f}%)")
        report.append("")
        
        # Critical P0 Issues
        p0_failures = self.metrics['priorities'].get('P0', {}).get('critical_failures', [])
        if p0_failures:
            report.append("🚨 CRITICAL P0 FAILURES")
            report.append("-" * 40)
            for failure in p0_failures:
                report.append(f"Feature: {failure['feature']}")
                report.append(f"Issue: {failure['description']}")
                if failure['ticket']:
                    report.append(f"Ticket: {failure['ticket']}")
                report.append("")
        
        # Feature Coverage
        report.append("🔍 FEATURE COVERAGE ANALYSIS")
        report.append("-" * 40)
        features = self.metrics['features']
        for feature, stats in sorted(features.items()):
            execution_rate = (stats['executed'] / stats['total']) * 100 if stats['total'] > 0 else 0
            report.append(f"{feature}:")
            report.append(f"  Total: {stats['total']} | Executed: {stats['executed']} ({execution_rate:.1f}%)")
            report.append(f"  Pass Rate: {stats['pass_rate']}% | Pass: {stats['pass']} | Fail: {stats['fail']}")
            report.append("")
        
        # Role Coverage
        report.append("👥 ROLE-BASED COVERAGE")
        report.append("-" * 40)
        roles = self.metrics['roles']
        for role, stats in sorted(roles.items()):
            execution_rate = (stats['executed'] / stats['total']) * 100 if stats['total'] > 0 else 0
            report.append(f"{role}:")
            report.append(f"  Total: {stats['total']} | Executed: {stats['executed']} ({execution_rate:.1f}%)")
            report.append(f"  Pass Rate: {stats['pass_rate']}% | Pass: {stats['pass']} | Fail: {stats['fail']}")
            report.append("")
        
        # Device Coverage
        report.append("📱 DEVICE SIZE COVERAGE")
        report.append("-" * 40)
        devices = self.metrics['devices']
        for device, stats in sorted(devices.items()):
            execution_rate = (stats['executed'] / stats['total']) * 100 if stats['total'] > 0 else 0
            report.append(f"{device}:")
            report.append(f"  Total: {stats['total']} | Executed: {stats['executed']} ({execution_rate:.1f}%)")
            report.append(f"  Pass Rate: {stats['pass_rate']}% | Pass: {stats['pass']} | Fail: {stats['fail']}")
            report.append("")
        
        # Priority-wise Analysis
        report.append("⚡ PRIORITY-WISE ANALYSIS")
        report.append("-" * 40)
        priorities = self.metrics['priorities']
        for priority in ['P0', 'P1', 'P2']:
            if priority in priorities:
                stats = priorities[priority]
                execution_rate = (stats['executed'] / stats['total']) * 100 if stats['total'] > 0 else 0
                report.append(f"{priority} ({self.get_priority_name(priority)}):")
                report.append(f"  Total: {stats['total']} | Executed: {stats['executed']} ({execution_rate:.1f}%)")
                report.append(f"  Pass Rate: {stats['pass_rate']}% | Pass: {stats['pass']} | Fail: {stats['fail']}")
                report.append("")
        
        # Recommendations
        report.append("💡 RECOMMENDATIONS")
        report.append("-" * 40)
        recommendations = self.generate_recommendations()
        for rec in recommendations:
            report.append(f"• {rec}")
        report.append("")
        
        # Test Completion Status
        report.append("📈 TEST COMPLETION TRACKING")
        report.append("-" * 40)
        completion_percentage = (basic['executed_tests'] / basic['total_tests']) * 100 if basic['total_tests'] > 0 else 0
        report.append(f"Overall Completion: {completion_percentage:.1f}%")
        
        progress_bar_length = 50
        filled_length = int(progress_bar_length * completion_percentage / 100)
        bar = '█' * filled_length + '-' * (progress_bar_length - filled_length)
        report.append(f"Progress: |{bar}| {completion_percentage:.1f}%")
        report.append("")
        
        report.append("=" * 80)
        
        return "\n".join(report)
    
    def get_priority_name(self, priority):
        """Get descriptive name for priority level"""
        priority_names = {
            'P0': 'Critical - Security & Data Loss',
            'P1': 'High - Core Functionality', 
            'P2': 'Medium - User Experience'
        }
        return priority_names.get(priority, priority)
    
    def generate_recommendations(self):
        """Generate recommendations based on metrics"""
        recommendations = []
        basic = self.metrics['basic']
        priorities = self.metrics['priorities']
        
        # P0 failure recommendations
        p0_failures = priorities.get('P0', {}).get('fail', 0)
        if p0_failures > 0:
            recommendations.append(f"URGENT: Address {p0_failures} P0 failures before proceeding with other tests")
        
        # Execution coverage recommendations
        if basic['not_executed'] > basic['executed_tests']:
            recommendations.append("Increase test execution - more tests pending than completed")
        
        # Pass rate recommendations
        if basic['pass_rate'] < 90:
            recommendations.append("Focus on improving pass rate - currently below 90%")
        
        # Feature-specific recommendations
        features = self.metrics['features']
        low_coverage_features = [f for f, stats in features.items() if 
                                stats['executed'] / stats['total'] < 0.5 if stats['total'] > 0]
        if low_coverage_features:
            recommendations.append(f"Improve test coverage for: {', '.join(low_coverage_features)}")
        
        # Device coverage recommendations
        devices = self.metrics['devices']
        if 'All' in devices and devices['All']['executed'] / devices['All']['total'] < 0.8:
            recommendations.append("Increase device-specific testing - many tests only cover 'All' devices")
        
        # Role coverage recommendations  
        roles = self.metrics['roles']
        low_role_coverage = [r for r, stats in roles.items() if 
                            stats['executed'] / stats['total'] < 0.5 if stats['total'] > 0]
        if low_role_coverage:
            recommendations.append(f"Improve role-based testing for: {', '.join(low_role_coverage)}")
        
        return recommendations
    
    def analyze(self):
        """Run complete analysis"""
        print("🔍 Analyzing test metrics...")
        self.load_test_data()
        self.calculate_basic_metrics()
        self.calculate_feature_coverage()
        self.calculate_role_coverage() 
        self.calculate_device_coverage()
        self.calculate_priority_metrics()
        
        report = self.generate_report()
        
        # Save report to file
        report_file = f"test-metrics-report-{datetime.now().strftime('%Y%m%d-%H%M%S')}.txt"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"✅ Analysis complete! Report saved to: {report_file}")
        print("\n" + report)
        
        return self.metrics

def main():
    """Main function"""
    analyzer = TestMetricsAnalyzer()
    analyzer.analyze()

if __name__ == "__main__":
    main()
