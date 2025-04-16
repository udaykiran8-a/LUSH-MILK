import React, { useState } from 'react';
import { validateAddress } from '@/services/LocationService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Check, MapPin, AlertTriangle, Loader2 } from 'lucide-react';

interface AddressValidatorProps {
  onAddressValidated: (result: {
    isValid: boolean;
    address: string;
    lat?: number;
    lng?: number;
  }) => void;
  initialAddress?: string;
  required?: boolean;
}

const AddressValidator: React.FC<AddressValidatorProps> = ({
  onAddressValidated,
  initialAddress = '',
  required = true,
}) => {
  const [address, setAddress] = useState(initialAddress);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [coordinates, setCoordinates] = useState<{lat: number; lng: number} | null>(null);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    // Reset validation when the address changes
    if (validationStatus !== 'idle') {
      setValidationStatus('idle');
      setValidationMessage('');
    }
  };

  const validateUserAddress = async () => {
    if (!address.trim() && !required) {
      return;
    }
    
    if (!address.trim() && required) {
      setValidationStatus('invalid');
      setValidationMessage('Please enter an address');
      return;
    }

    setValidationStatus('loading');
    
    try {
      const result = await validateAddress(address);
      
      if (result.isValid && result.lat && result.lng) {
        setValidationStatus('valid');
        setValidationMessage('Address validated successfully');
        setCoordinates({ lat: result.lat, lng: result.lng });
        
        onAddressValidated({
          isValid: true,
          address,
          lat: result.lat,
          lng: result.lng
        });
      } else {
        setValidationStatus('invalid');
        setValidationMessage(result.message || 'Invalid address');
        
        onAddressValidated({
          isValid: false,
          address
        });
      }
    } catch (error) {
      console.error('Address validation error:', error);
      setValidationStatus('invalid');
      setValidationMessage('Error validating address. Please try again.');
      
      onAddressValidated({
        isValid: false,
        address
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="address" className="font-medium">
          Delivery Address {required && <span className="text-red-500">*</span>}
        </Label>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-lushmilk-terracotta/60" />
            <Input
              id="address"
              value={address}
              onChange={handleAddressChange}
              placeholder="Enter your full delivery address"
              className="pl-10"
              required={required}
            />
          </div>
          
          <Button 
            type="button" 
            onClick={validateUserAddress}
            disabled={validationStatus === 'loading' || !address.trim()}
            variant={validationStatus === 'valid' ? 'outline' : 'default'}
            className={validationStatus === 'valid' ? 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200' : ''}
          >
            {validationStatus === 'loading' && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            {validationStatus === 'valid' && (
              <Check className="h-4 w-4 mr-2" />
            )}
            {validationStatus === 'valid' ? 'Verified' : 'Verify Address'}
          </Button>
        </div>
      </div>
      
      {validationStatus === 'valid' && (
        <Alert className="bg-green-50 border-green-200 text-green-700">
          <Check className="h-4 w-4" />
          <AlertTitle>Delivery Available</AlertTitle>
          <AlertDescription>
            We deliver to this location. Your address has been verified.
          </AlertDescription>
        </Alert>
      )}
      
      {validationStatus === 'invalid' && (
        <Alert className="bg-orange-50 border-orange-200 text-orange-700">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Validation Failed</AlertTitle>
          <AlertDescription>
            {validationMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AddressValidator; 