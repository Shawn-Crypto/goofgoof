#!/usr/bin/env python3
# Script to update index.html with testimonials section

# Read the current index.html
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add testimonials CSS before /* Final CTA */
testimonials_css = """        /* Testimonials Section */
        .testimonials {
            background: rgba(0, 0, 0, 0.3);
            padding: 80px 40px;
        }
        
        .section-subtitle {
            font-size: 20px;
            color: rgba(255, 255, 255, 0.8);
            text-align: center;
            margin-bottom: 48px;
            margin-top: -40px;
        }
        
        .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 32px;
            margin-bottom: 60px;
        }
        
        .testimonial-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 32px;
            transition: all 0.3s ease;
        }
        
        .testimonial-card:hover {
            transform: translateY(-4px);
            background: rgba(255, 255, 255, 0.08);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .testimonial-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
        }
        
        .testimonial-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            background: linear-gradient(135deg, #2CA58D, #F4A261);
            padding: 2px;
        }
        
        .testimonial-info h4 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .testimonial-info p {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 4px;
        }
        
        .rating {
            color: #F4A261;
            font-size: 14px;
            letter-spacing: 2px;
        }
        
        .testimonial-text {
            font-size: 16px;
            line-height: 1.8;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 20px;
            font-style: italic;
        }
        
        .testimonial-text strong {
            color: #2CA58D;
            font-style: normal;
        }
        
        .testimonial-metric {
            background: rgba(44, 165, 141, 0.1);
            border-left: 3px solid #2CA58D;
            padding: 12px 16px;
            border-radius: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .metric-label {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
        }
        
        .metric-value {
            font-size: 16px;
            font-weight: 600;
            color: #2CA58D;
        }
        
        .testimonial-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
            max-width: 900px;
            margin: 0 auto;
        }
        
        .stat-box {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 32px;
            border-radius: 12px;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .stat-box:hover {
            transform: translateY(-4px);
            background: rgba(255, 255, 255, 0.08);
        }
        
        .stat-box h3 {
            font-size: 36px;
            color: #F4A261;
            font-weight: 800;
            margin-bottom: 8px;
        }
        
        .stat-box p {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.8);
        }
        
"""

# Insert CSS before /* Final CTA */
content = content.replace('        /* Final CTA */', testimonials_css + '        /* Final CTA */')

# 2. Update mobile responsive CSS
mobile_css = """            
            .testimonials-grid {
                grid-template-columns: 1fr;
            }
            
            .testimonial-stats {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .stat-box {
                padding: 20px;
            }
            
            .stat-box h3 {
                font-size: 28px;
            }"""

# Insert mobile CSS before the closing }
content = content.replace(
    '            .emi-option strong {\n                font-size: 20px;\n            }\n        }',
    '            .emi-option strong {\n                font-size: 20px;\n            }' + mobile_css + '\n        }'
)

# 3. Update navigation links
content = content.replace(
    '<a href="#instructor" class="nav-link">Your Instructor</a>\n        <a href="#enroll" class="nav-link">Enroll Now</a>',
    '<a href="#instructor" class="nav-link">Your Instructor</a>\n        <a href="#testimonials" class="nav-link">Success Stories</a>\n        <a href="#enroll" class="nav-link">Enroll Now</a>'
)

# 4. Update progress dots
content = content.replace(
    '<div class="progress-dot" data-title="Instructor" data-section="instructor"></div>\n        <div class="progress-dot" data-title="Enroll" data-section="final-cta"></div>',
    '<div class="progress-dot" data-title="Instructor" data-section="instructor"></div>\n        <div class="progress-dot" data-title="Testimonials" data-section="testimonials"></div>\n        <div class="progress-dot" data-title="Enroll" data-section="final-cta"></div>'
)

# 5. Add testimonials section HTML
testimonials_html = """

    <!-- Testimonials Section -->
    <section class="testimonials" id="testimonials">
        <div class="container animate-in">
            <h2 class="section-title">Success Stories from Our Students</h2>
            <p class="section-subtitle">Join 500+ investors who've transformed their financial future</p>
            
            <div class="testimonials-grid">
                <!-- Testimonial 1 -->
                <div class="testimonial-card">
                    <div class="testimonial-header">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun" alt="Arjun Mehta" class="testimonial-avatar">
                        <div class="testimonial-info">
                            <h4>Arjun Mehta</h4>
                            <p>IT Manager, Bengaluru</p>
                            <div class="rating">★★★★★</div>
                        </div>
                    </div>
                    <p class="testimonial-text">
                        "I was investing randomly based on tips from friends. After Rohit's course, I built a systematic portfolio that's given me <strong>23% returns in just 8 months</strong>. The framework for analyzing stocks is pure gold!"
                    </p>
                    <div class="testimonial-metric">
                        <span class="metric-label">Portfolio Growth:</span>
                        <span class="metric-value">₹3.2L → ₹3.94L</span>
                    </div>
                </div>

                <!-- Testimonial 2 -->
                <div class="testimonial-card">
                    <div class="testimonial-header">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" alt="Priya Sharma" class="testimonial-avatar">
                        <div class="testimonial-info">
                            <h4>Priya Sharma</h4>
                            <p>Doctor, Mumbai</p>
                            <div class="rating">★★★★★</div>
                        </div>
                    </div>
                    <p class="testimonial-text">
                        "As a busy doctor, I had no time for market research. This course taught me to identify quality stocks in just 30 minutes. Already recovered the course fee through my first month's gains!"
                    </p>
                    <div class="testimonial-metric">
                        <span class="metric-label">Time to First Profit:</span>
                        <span class="metric-value">Just 3 weeks</span>
                    </div>
                </div>

                <!-- Testimonial 3 -->
                <div class="testimonial-card">
                    <div class="testimonial-header">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh" alt="Rajesh Kumar" class="testimonial-avatar">
                        <div class="testimonial-info">
                            <h4>Rajesh Kumar</h4>
                            <p>Business Owner, Delhi</p>
                            <div class="rating">★★★★★</div>
                        </div>
                    </div>
                    <p class="testimonial-text">
                        "Lost ₹2 lakhs in F&O before finding this course. Rohit's risk management module saved my capital. Now making consistent returns with proper position sizing. Worth every rupee!"
                    </p>
                    <div class="testimonial-metric">
                        <span class="metric-label">Monthly Returns:</span>
                        <span class="metric-value">Avg 3-4% consistent</span>
                    </div>
                </div>

                <!-- Testimonial 4 -->
                <div class="testimonial-card">
                    <div class="testimonial-header">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha" alt="Sneha Patel" class="testimonial-avatar">
                        <div class="testimonial-info">
                            <h4>Sneha Patel</h4>
                            <p>CA, Ahmedabad</p>
                            <div class="rating">★★★★★</div>
                        </div>
                    </div>
                    <p class="testimonial-text">
                        "Being a CA, I understood financials but not market dynamics. The sector rotation strategy helped me catch the banking rally early. <strong>42% gains in my banking portfolio!</strong>"
                    </p>
                    <div class="testimonial-metric">
                        <span class="metric-label">Best Pick:</span>
                        <span class="metric-value">HDFC Bank +68%</span>
                    </div>
                </div>

                <!-- Testimonial 5 -->
                <div class="testimonial-card">
                    <div class="testimonial-header">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Amit" alt="Amit Agarwal" class="testimonial-avatar">
                        <div class="testimonial-info">
                            <h4>Amit Agarwal</h4>
                            <p>Startup Founder, Pune</p>
                            <div class="rating">★★★★★</div>
                        </div>
                    </div>
                    <p class="testimonial-text">
                        "The crisis investing module was eye-opening. Bought quality stocks during the recent correction using Rohit's framework. Already up 15% while others are still fearful."
                    </p>
                    <div class="testimonial-metric">
                        <span class="metric-label">Crisis Returns:</span>
                        <span class="metric-value">+15% in 2 months</span>
                    </div>
                </div>

                <!-- Testimonial 6 -->
                <div class="testimonial-card">
                    <div class="testimonial-header">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita" alt="Kavita Reddy" class="testimonial-avatar">
                        <div class="testimonial-info">
                            <h4>Kavita Reddy</h4>
                            <p>Bank Manager, Hyderabad</p>
                            <div class="rating">★★★★★</div>
                        </div>
                    </div>
                    <p class="testimonial-text">
                        "Started with just ₹50,000. The portfolio management module helped me grow it systematically. Now managing ₹8 lakhs across 12 stocks with confidence. Financial freedom feels achievable!"
                    </p>
                    <div class="testimonial-metric">
                        <span class="metric-label">Portfolio Growth:</span>
                        <span class="metric-value">16x in 18 months</span>
                    </div>
                </div>
            </div>

            <div class="testimonial-stats">
                <div class="stat-box">
                    <h3>500+</h3>
                    <p>Active Students</p>
                </div>
                <div class="stat-box">
                    <h3>₹12.4 Cr</h3>
                    <p>Combined Portfolio Value</p>
                </div>
                <div class="stat-box">
                    <h3>27%</h3>
                    <p>Avg Annual Returns</p>
                </div>
                <div class="stat-box">
                    <h3>4.8/5</h3>
                    <p>Student Rating</p>
                </div>
            </div>
        </div>
    </section>
"""

# Insert testimonials section after instructor section
content = content.replace(
    '</section>\n\n    <!-- Final CTA -->',
    '</section>' + testimonials_html + '\n    <!-- Final CTA -->'
)

# Write the updated content
with open('index_with_testimonials.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Index.html has been updated with testimonials section!")
print("File saved as: index_with_testimonials.html")
print("\nChanges made:")
print("1. Added testimonials CSS styles")
print("2. Updated mobile responsive styles")
print("3. Added 'Success Stories' to navigation")
print("4. Added testimonials progress dot")
print("5. Added complete testimonials section with 6 testimonials")
print("6. Used dicebear avatars for placeholder images")