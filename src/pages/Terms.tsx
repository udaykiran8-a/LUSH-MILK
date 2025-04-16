import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const Terms = () => {
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-lushmilk-brown mb-8 text-center">
            Terms and Conditions
          </h1>
          
          <Card className="mb-8 shadow-sm">
            <CardHeader>
              <CardTitle>1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lushmilk-charcoal/80">
              <p>
                Welcome to LushMilk. These Terms and Conditions govern your use of our website and services. 
                By accessing or using our website, placing orders, or subscribing to our services, you agree 
                to be bound by these Terms and Conditions.
              </p>
              <p>
                Please read these Terms carefully before using our services. If you do not agree with any part 
                of these terms, please do not use our website or services.
              </p>
            </CardContent>
          </Card>
          
          <Card className="mb-8 shadow-sm">
            <CardHeader>
              <CardTitle>2. Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lushmilk-charcoal/80">
              <p>
                We make every effort to display as accurately as possible the colors, features, specifications, 
                and details of the products available on our website. However, we cannot guarantee that your 
                computer's display of any color will be accurate, and we do not guarantee that product descriptions 
                or other content is accurate, complete, reliable, current, or error-free.
              </p>
              <p>
                All products are subject to availability, and we reserve the right to discontinue any product at 
                any time.
              </p>
            </CardContent>
          </Card>
          
          <Card className="mb-8 shadow-sm">
            <CardHeader>
              <CardTitle>3. Pricing and Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lushmilk-charcoal/80">
              <p>
                All prices are in Indian Rupees (INR) and include applicable taxes unless otherwise stated. We reserve 
                the right to change prices for products displayed at any time, and to correct pricing errors that may 
                inadvertently occur.
              </p>
              <p>
                Payment can be made through various payment methods available on our website. By submitting your payment 
                information, you authorize us to charge your payment method for the total amount of your order including 
                taxes, shipping, and handling charges where applicable.
              </p>
            </CardContent>
          </Card>
          
          <Card className="mb-8 shadow-sm">
            <CardHeader>
              <CardTitle>4. Delivery and Subscriptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lushmilk-charcoal/80">
              <p>
                We deliver to the locations specified on our website. Delivery times may vary depending on your location
                and the availability of our delivery personnel. We aim to deliver fresh milk between 4:00 AM and 7:00 AM 
                daily for all subscription orders.
              </p>
              <p>
                For subscription services, you agree to maintain an active payment method on file. Subscriptions will 
                automatically renew for successive periods until canceled. You may cancel your subscription at any time 
                by logging into your account or contacting our customer service at least 24 hours before your next 
                scheduled delivery.
              </p>
            </CardContent>
          </Card>
          
          <Card className="mb-8 shadow-sm">
            <CardHeader>
              <CardTitle>5. Account Registration and Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lushmilk-charcoal/80">
              <p>
                To place an order or subscribe to our services, you may be required to create an account. You are 
                responsible for maintaining the confidentiality of your account information and password, and for 
                restricting access to your account.
              </p>
              <p>
                You agree to accept responsibility for all activities that occur under your account. You must notify 
                us immediately of any unauthorized use of your account or any other breach of security.
              </p>
            </CardContent>
          </Card>
          
          <Card className="mb-8 shadow-sm">
            <CardHeader>
              <CardTitle>6. User Content and Conduct</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lushmilk-charcoal/80">
              <p>
                Users may be able to post reviews, comments, and other content on our website. By posting content, 
                you grant us a non-exclusive, royalty-free, perpetual, irrevocable, and fully sublicensable right to 
                use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display 
                such content throughout the world in any media.
              </p>
              <p>
                You agree not to post content that is unlawful, threatening, abusive, defamatory, or otherwise objectionable. 
                We reserve the right to remove any content that violates these terms or that we find objectionable for any reason.
              </p>
            </CardContent>
          </Card>
          
          <Card className="mb-8 shadow-sm">
            <CardHeader>
              <CardTitle>7. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lushmilk-charcoal/80">
              <p>
                We reserve the right to modify these Terms and Conditions at any time. Changes will be effective 
                immediately upon posting on the website. Your continued use of the website following the posting 
                of changes constitutes your acceptance of such changes.
              </p>
            </CardContent>
          </Card>
          
          <Card className="mb-8 shadow-sm">
            <CardHeader>
              <CardTitle>8. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lushmilk-charcoal/80">
              <p>
                If you have any questions about our Terms and Conditions, please contact us at:
              </p>
              <p className="font-medium">
                Email: info@lushmilk.in<br />
                Phone: +91 9876543210<br />
                Address: 123 Milk Street, Chennai, Tamil Nadu, India - 600001
              </p>
            </CardContent>
          </Card>
          
          <p className="text-sm text-lushmilk-charcoal/60 text-center mt-8">
            Last updated: April 7, 2025
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Terms;
