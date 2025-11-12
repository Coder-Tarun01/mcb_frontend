import * as yup from 'yup';

// Shared regex for strong passwords: min 8, upper, lower, number, special
export const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .required('Email is required')
    .email('Enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  rememberMe: yup.boolean().optional()
});

export const signupSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Full name is required')
    .min(3, 'Full name must be at least 3 characters'),
  email: yup
    .string()
    .trim()
    .required('Email is required')
    .email('Enter a valid email address'),
  role: yup
    .mixed<'employee' | 'employer'>()
    .oneOf(['employee', 'employer'], 'Please select a role')
    .required('Role is required'),
  password: yup
    .string()
    .required('Password is required')
    .matches(
      strongPasswordRegex,
      'Must include uppercase, lowercase, number, and special character'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  companyName: yup
    .string()
    .when('role', {
      is: (val: string) => val === 'employer',
      then: schema => schema.trim().required('Company name is required'),
      otherwise: schema => schema.optional()
    }),
  skills: yup
    .string()
    .when('role', {
      is: (val: string) => val === 'employee',
      then: schema => schema.optional(),
      otherwise: schema => schema.optional()
    }),
  acceptTerms: yup.boolean().oneOf([true], 'You must accept the Terms of Service and Privacy Policy').required()
});

export type LoginFormValues = yup.InferType<typeof loginSchema> & { rememberMe?: boolean };
export type SignupFormValues = yup.InferType<typeof signupSchema> & { acceptTerms?: boolean };


