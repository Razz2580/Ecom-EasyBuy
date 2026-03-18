import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, ShoppingBag, User, Mail, Lock, Phone, Store, Bike, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      fullName: '',
      phone: '',
      role: UserRole.CUSTOMER,
      storeName: '',
      storeDescription: '',
      address: '',
      vehicleType: '',
      vehicleNumber: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
      fullName: Yup.string().required('Full name is required'),
      phone: Yup.string(),
      role: Yup.string().required('Role is required'),
      storeName: Yup.string().when('role', {
        is: (role: string) => role === UserRole.SELLER,
        then: (schema) => schema.required('Store name is required'),
      }),
      vehicleType: Yup.string().when('role', {
        is: (role: string) => role === UserRole.RIDER,
        then: (schema) => schema.required('Vehicle type is required'),
      }),
    }),
    onSubmit: async (values) => {
      try {
        setError(null);
        await register(values);
        navigate('/dashboard');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    },
  });

  const nextStep = () => {
    if (step === 1) {
      if (!formik.values.email || !formik.values.password || !formik.values.fullName) {
        formik.setTouched({ email: true, password: true, fullName: true });
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const renderRoleFields = () => {
    const role = formik.values.role as string;
    if (role === 'SELLER') {
      return (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name *</Label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="storeName"
                name="storeName"
                placeholder="Your store name"
                className="pl-10"
                value={formik.values.storeName}
                onChange={formik.handleChange}
              />
            </div>
            {formik.touched.storeName && formik.errors.storeName && (
              <p className="text-sm text-red-500">{formik.errors.storeName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeDescription">Store Description</Label>
            <Input
              id="storeDescription"
              name="storeDescription"
              placeholder="Describe your store"
              value={formik.values.storeDescription}
              onChange={formik.handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="address"
                name="address"
                placeholder="Your store address"
                className="pl-10"
                value={formik.values.address}
                onChange={formik.handleChange}
              />
            </div>
          </div>
        </motion.div>
      );
    }
    if (role === 'RIDER') {
      return (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type *</Label>
            <div className="relative">
              <Bike className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="vehicleType"
                name="vehicleType"
                placeholder="e.g., Motorcycle, Bicycle"
                className="pl-10"
                value={formik.values.vehicleType}
                onChange={formik.handleChange}
              />
            </div>
            {formik.touched.vehicleType && formik.errors.vehicleType && (
              <p className="text-sm text-red-500">{formik.errors.vehicleType}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicleNumber">Vehicle Number</Label>
            <Input
              id="vehicleNumber"
              name="vehicleNumber"
              placeholder="Vehicle registration number"
              value={formik.values.vehicleNumber}
              onChange={formik.handleChange}
            />
          </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4"
            >
              <ShoppingBag className="w-8 h-8 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Join EasyBuy marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="fullName"
                          name="fullName"
                          placeholder="Your full name"
                          className="pl-10"
                          value={formik.values.fullName}
                          onChange={formik.handleChange}
                        />
                      </div>
                      {formik.touched.fullName && formik.errors.fullName && (
                        <p className="text-sm text-red-500">{formik.errors.fullName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10"
                          value={formik.values.email}
                          onChange={formik.handleChange}
                        />
                      </div>
                      {formik.touched.email && formik.errors.email && (
                        <p className="text-sm text-red-500">{formik.errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="Your phone number"
                          className="pl-10"
                          value={formik.values.phone}
                          onChange={formik.handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          className="pl-10 pr-10"
                          value={formik.values.password}
                          onChange={formik.handleChange}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {formik.touched.password && formik.errors.password && (
                        <p className="text-sm text-red-500">{formik.errors.password}</p>
                      )}
                    </div>

                    <Button type="button" className="w-full" onClick={nextStep}>
                      Next <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label>I want to join as:</Label>
                      <RadioGroup
                        value={formik.values.role}
                        onValueChange={(value) => formik.setFieldValue('role', value)}
                        className="grid grid-cols-3 gap-2"
                      >
                        <div>
                          <RadioGroupItem
                            value={UserRole.CUSTOMER}
                            id="customer"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="customer"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer"
                          >
                            <User className="mb-2 h-6 w-6" />
                            <span className="text-sm">Customer</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem
                            value={UserRole.SELLER}
                            id="seller"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="seller"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer"
                          >
                            <Store className="mb-2 h-6 w-6" />
                            <span className="text-sm">Seller</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem
                            value={UserRole.RIDER}
                            id="rider"
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor="rider"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer"
                          >
                            <Bike className="mb-2 h-6 w-6" />
                            <span className="text-sm">Rider</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {renderRoleFields()}

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" className="flex-1" onClick={prevStep}>
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button type="submit" className="flex-1" disabled={formik.isSubmitting}>
                        {formik.isSubmitting ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
