-- Database Functions for SM Rewards Balance Management
-- These functions bypass RLS policies for balance updates

-- Function to add SM rewards to a specific user's balance
CREATE OR REPLACE FUNCTION public.add_sm_rewards_to_user(
    p_user_id UUID,
    p_amount DECIMAL(10, 2)
)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance DECIMAL(10, 2);
    new_balance DECIMAL(10, 2);
BEGIN
    -- Get current balance
    SELECT sm_rewards_balance INTO current_balance
    FROM profiles
    WHERE id = p_user_id;
    
    -- If user not found, return false
    IF current_balance IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate new balance
    new_balance := current_balance + p_amount;
    
    -- Update the balance
    UPDATE profiles
    SET 
        sm_rewards_balance = new_balance,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Return true if update was successful
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.add_sm_rewards_to_user(UUID, DECIMAL)
IS 'Adds SM rewards to a specific user balance. Bypasses RLS for transfer operations.';

-- Function to deduct SM rewards from a specific user's balance
CREATE OR REPLACE FUNCTION public.deduct_sm_rewards_from_user(
    p_user_id UUID,
    p_amount DECIMAL(10, 2)
)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance DECIMAL(10, 2);
    new_balance DECIMAL(10, 2);
BEGIN
    -- Get current balance
    SELECT sm_rewards_balance INTO current_balance
    FROM profiles
    WHERE id = p_user_id;
    
    -- If user not found, return false
    IF current_balance IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user has sufficient balance
    IF current_balance < p_amount THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate new balance
    new_balance := current_balance - p_amount;
    
    -- Update the balance
    UPDATE profiles
    SET 
        sm_rewards_balance = new_balance,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Return true if update was successful
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.deduct_sm_rewards_from_user(UUID, DECIMAL)
IS 'Deducts SM rewards from a specific user balance. Bypasses RLS for transfer operations.';

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.add_sm_rewards_to_user(UUID, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_sm_rewards_from_user(UUID, DECIMAL) TO authenticated; 