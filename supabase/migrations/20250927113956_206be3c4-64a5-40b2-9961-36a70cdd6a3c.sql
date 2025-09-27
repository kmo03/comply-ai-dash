-- Create employees table for BEE compliance data
CREATE TABLE public.employees (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  race VARCHAR(50) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  management_level VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public access for demo purposes
-- In production, you'd want to restrict this based on user authentication
CREATE POLICY "Allow public access to employees" 
ON public.employees 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create index for faster session lookups
CREATE INDEX idx_employees_session_id ON public.employees(session_id);