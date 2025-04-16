import React, { useState, useEffect } from 'react';
import { 
  getCustomerSubscriptions, 
  changeSubscriptionStatus,
  updateSubscription,
  generateDeliveryDates,
  SubscriptionWithDetails
} from '@/services/SubscriptionService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  PauseCircle, 
  PlayCircle, 
  Edit2, 
  XCircle,
  Check,
  ChevronDown,
  RefreshCw,
  MapPin
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const SubscriptionManagement = () => {
  const { user, userProfile } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionWithDetails | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [deliverySchedule, setDeliverySchedule] = useState<string>('daily');
  const [deliveryTime, setDeliveryTime] = useState<string>('morning');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');

  useEffect(() => {
    if (user && userProfile) {
      loadSubscriptions();
    }
  }, [user, userProfile]);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      if (userProfile?.auth_uid) {
        const subs = await getCustomerSubscriptions(userProfile.auth_uid);
        setSubscriptions(subs);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast.error('Failed to load your subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (subscriptionId: string, newStatus: 'active' | 'paused' | 'cancelled') => {
    try {
      const success = await changeSubscriptionStatus(subscriptionId, newStatus);
      if (success) {
        // Update local state
        setSubscriptions(prev => 
          prev.map(sub => 
            sub.id === subscriptionId 
              ? { ...sub, status: newStatus } 
              : sub
          )
        );
      }
    } catch (error) {
      console.error('Error changing subscription status:', error);
    }
  };

  const handleEdit = (subscription: SubscriptionWithDetails) => {
    setEditingSubscription(subscription);
    setQuantity(subscription.quantity_liters);
    setDeliverySchedule(subscription.delivery_schedule);
    setDeliveryTime(subscription.delivery_time);
    setDeliveryAddress(subscription.address || '');
    setShowEditDialog(true);
  };

  const saveSubscriptionChanges = async () => {
    if (!editingSubscription) return;
    
    try {
      const success = await updateSubscription(editingSubscription.id, {
        customerId: editingSubscription.customer_id,
        milkType: editingSubscription.milk_type,
        quantityLiters: quantity,
        deliverySchedule: deliverySchedule as any,
        deliveryTime: deliveryTime as any,
        startDate: editingSubscription.start_date,
        deliveryAddress: deliveryAddress
      });
      
      if (success) {
        // Update local state
        setSubscriptions(prev => 
          prev.map(sub => 
            sub.id === editingSubscription.id 
              ? { 
                  ...sub, 
                  quantity_liters: quantity,
                  delivery_schedule: deliverySchedule,
                  delivery_time: deliveryTime,
                  address: deliveryAddress
                } 
              : sub
          )
        );
        setShowEditDialog(false);
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Could not update subscription');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'paused':
        return <Badge className="bg-amber-100 text-amber-800">Paused</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getNextDeliveryDate = (subscription: SubscriptionWithDetails) => {
    if (subscription.status !== 'active') {
      return 'No upcoming deliveries';
    }
    
    const dates = generateDeliveryDates(
      subscription.start_date,
      subscription.end_date,
      subscription.delivery_schedule,
      5
    );
    
    // Find the first date that's after now
    const now = new Date();
    const nextDate = dates.find(date => date > now);
    
    return nextDate 
      ? format(nextDate, 'EEEE, MMMM d') 
      : 'No upcoming deliveries';
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">My Subscriptions</h1>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <Card key={i} className="w-full">
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Subscriptions</h1>
        <Button onClick={loadSubscriptions} size="sm" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {subscriptions.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-lg font-medium mb-2">No active subscriptions</h2>
          <p className="text-gray-500 mb-6">Subscribe to get fresh milk delivered regularly.</p>
          <Button>Browse Milk Products</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{subscription.milk_type} Milk Subscription</CardTitle>
                    <CardDescription>
                      {subscription.quantity_liters}L {subscription.delivery_schedule === 'daily' ? 'Daily' : 
                        subscription.delivery_schedule === 'alternate_days' ? 'Every Other Day' : 'Weekly'}
                    </CardDescription>
                  </div>
                  {getStatusBadge(subscription.status)}
                </div>
              </CardHeader>
              
              <CardContent className="pb-3">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-lushmilk-terracotta" />
                    <div>
                      <div className="text-sm font-medium">Next Delivery</div>
                      <div className="text-sm text-lushmilk-charcoal/60">
                        {getNextDeliveryDate(subscription)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-lushmilk-terracotta" />
                    <div>
                      <div className="text-sm font-medium">Delivery Time</div>
                      <div className="text-sm text-lushmilk-charcoal/60">
                        {subscription.delivery_time === 'morning' ? '4:00 AM - 7:00 AM' : '5:00 PM - 7:00 PM'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-lushmilk-terracotta" />
                  <div>
                    <div className="text-sm font-medium">Delivery Address</div>
                    <div className="text-sm text-lushmilk-charcoal/60">
                      {subscription.address || 'No address provided'}
                    </div>
                  </div>
                </div>
                
                <Accordion type="single" collapsible className="border-t pt-2">
                  <AccordionItem value="delivery-schedule">
                    <AccordionTrigger className="py-2">
                      Upcoming Deliveries
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 py-1">
                        {generateDeliveryDates(
                          subscription.start_date,
                          subscription.end_date,
                          subscription.delivery_schedule,
                          5
                        ).map((date, index) => (
                          <div key={index} className="flex justify-between px-2 py-1 rounded-md bg-gray-50">
                            <span>{format(date, 'EEE, MMM d')}</span>
                            <span className="text-lushmilk-terracotta/80 text-sm">
                              {subscription.quantity_liters}L
                            </span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              
              <CardFooter className="flex gap-2 pt-2 border-t">
                {subscription.status === 'active' ? (
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleStatusChange(subscription.id, 'paused')}
                  >
                    <PauseCircle className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                ) : subscription.status === 'paused' ? (
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleStatusChange(subscription.id, 'active')}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                ) : null}
                
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleEdit(subscription)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                
                {subscription.status !== 'cancelled' && (
                  <Button 
                    variant="outline" 
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleStatusChange(subscription.id, 'cancelled')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Edit Subscription Dialog */}
      {editingSubscription && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subscription</DialogTitle>
              <DialogDescription>
                Update your {editingSubscription.milk_type} Milk subscription details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (Liters)</Label>
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    disabled={quantity <= 0.5}
                    onClick={() => setQuantity(prev => Math.max(0.5, prev - 0.5))}
                  >
                    -
                  </Button>
                  <Input 
                    id="quantity" 
                    type="number" 
                    min={0.5}
                    step={0.5}
                    value={quantity} 
                    onChange={(e) => setQuantity(parseFloat(e.target.value))}
                    className="text-center"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuantity(prev => prev + 0.5)}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="schedule">Delivery Schedule</Label>
                <Select 
                  value={deliverySchedule} 
                  onValueChange={setDeliverySchedule}
                >
                  <SelectTrigger id="schedule">
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="alternate_days">Every Other Day</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Delivery Time</Label>
                <Select 
                  value={deliveryTime} 
                  onValueChange={setDeliveryTime}
                >
                  <SelectTrigger id="time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (4:00 AM - 7:00 AM)</SelectItem>
                    <SelectItem value="evening">Evening (5:00 PM - 7:00 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address</Label>
                <Input 
                  id="address" 
                  value={deliveryAddress} 
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your delivery address"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveSubscriptionChanges}>
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SubscriptionManagement; 