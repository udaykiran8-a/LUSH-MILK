
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const RefundPolicy = () => {
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
            Refund Policy
          </h1>
          
          <Card className="mb-8 shadow-sm">
            <CardHeader>
              <CardTitle>1. Returns and Refunds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lushmilk-charcoal/80">
              <p>
                At LushMilk, we are committed to providing high-quality, fresh milk products. Due to the 
                perishable nature of our products, we have specific guidelines for returns and refunds.
              </p>
              <p>
                If you are not satisfied with the quality of our products, please contact our customer 
                service team within 24 hours of delivery. We may ask for photographic evidence to 
                assess the condition of the product.
              </p>
            </CardContent>
          </Card>
          
          <Card className="mb-8 shadow-sm">
            <CardHeader>
              <CardTitle>2. Eligible Products for Return</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lushmilk-charcoal/80">
              <p>
                Returns are accepted in the following circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Product quality issues (spoilage, curdling, off taste, etc.)</li>
                <li>Incorrect product delivered</li>
                <li>Damaged packaging that affects product quality</li>
                <li>Missing items from your order</li>
              </ul>
              <p>
                Due to the perishable nature of our products, we cannot accept returns for:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Products that have been consumed more than 50%</li>
                <li>Products reported after 24 hours of delivery</li>
                <li>Change of mind or accidental orders (unless reported before delivery)</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="mb-8 shadow-sm">
            <CardHeader>
              <CardTitle>3. Refund Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lushmilk-charcoal/80">
              <p>
                Once your return request is approved, we will process your refund in one of the following ways:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Replacement of the product in your next delivery (for subscription customers)</li>
                <li>Credit to your LushMilk account for future purchases</li>
                <li>Refund to your original payment method (processing time: 5-7 business days)</li>
              </ul>
              <p>
                For subscription customers, we may offer the option to skip a delivery instead of receiving a refund.
              </p>
            </CardContent>
          </Card>
          
          <Card className="mb-8 shadow-sm">
            <CardHeader>
              <CardTitle>4. Cancellation Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lushmilk-charcoal/80">
              <p>
                <strong>One-time Orders:</strong> You may cancel your one-time order for a full refund if the 
                cancellation is made at least 12 hours before the scheduled delivery time.
              </p>
              <p>
                <strong>Subscription Plans:</strong> You may cancel your subscription at any time through your 
                account dashboard. Cancellations made less than 24 hours before your next scheduled delivery 
                will not affect that delivery but will apply to all future deliveries.
              </p>
              <p>
                <strong>Prepaid Monthly Subscriptions:</strong> If you cancel a prepaid monthly subscription 
                before the end of the billing cycle, we will provide a prorated refund for the remaining 
                undelivered days in that cycle.
              </p>
            </CardContent>
          </Card>
          
          <Card className="mb-8 shadow-sm">
            <CardHeader>
              <CardTitle>5. Contact for Refunds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lushmilk-charcoal/80">
              <p>
                To request a return or refund, please contact our customer support team through any of the following methods:
              </p>
              <p className="font-medium">
                Email: support@lushmilk.com<br />
                Phone: +91 9876543210 (6:00 AM - 8:00 PM, Monday to Sunday)<br />
                In-App/Website: Submit a request through your account dashboard
              </p>
              <p>
                Please have your order number and delivery date ready when contacting us for faster service.
              </p>
            </CardContent>
          </Card>
          
          <Card className="mb-8 shadow-sm">
            <CardHeader>
              <CardTitle>6. Policy Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-lushmilk-charcoal/80">
              <p>
                We reserve the right to update or change our refund policy at any time. Any changes will be 
                effective immediately upon posting the updated policy on our website.
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

export default RefundPolicy;
