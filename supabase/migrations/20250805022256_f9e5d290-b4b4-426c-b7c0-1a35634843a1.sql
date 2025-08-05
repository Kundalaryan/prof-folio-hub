-- Add DELETE policy for messages table to allow authenticated users to delete messages
CREATE POLICY "Only authenticated users can delete messages" 
ON public.messages 
FOR DELETE 
USING (auth.uid() IS NOT NULL);