import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Product } from '@/types';

const validationSchema = Yup.object({
  name: Yup.string().required('Product name is required'),
  price: Yup.number().positive('Price must be positive').required('Price is required'),
  stock: Yup.number().integer('Stock must be an integer').min(0, 'Stock cannot be negative').required('Stock is required'),
  description: Yup.string(),
  category: Yup.string(),
  imageUrl: Yup.string().url('Invalid URL'),
});

interface ProductFormProps {
  product: Product | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const formik = useFormik({
    initialValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      category: product?.category || '',
      imageUrl: product?.imageUrl || '',
      stock: product?.stock || 0,
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter product name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.name && formik.errors.name && (
          <p className="text-sm text-red-500">{formik.errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Enter product description"
          value={formik.values.description}
          onChange={formik.handleChange}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formik.values.price}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.price && formik.errors.price && (
            <p className="text-sm text-red-500">{formik.errors.price}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock *</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            placeholder="0"
            value={formik.values.stock}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.stock && formik.errors.stock && (
            <p className="text-sm text-red-500">{formik.errors.stock}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          name="category"
          placeholder="e.g., Electronics, Food, Clothing"
          value={formik.values.category}
          onChange={formik.handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          placeholder="https://example.com/image.jpg"
          value={formik.values.imageUrl}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.imageUrl && formik.errors.imageUrl && (
          <p className="text-sm text-red-500">{formik.errors.imageUrl}</p>
        )}
      </div>

      <div className="flex space-x-2 pt-4">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
}
