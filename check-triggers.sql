-- Check for triggers on the media table
SELECT 
    tgname AS trigger_name,
    pg_get_triggerdef(oid) AS trigger_definition
FROM 
    pg_trigger 
WHERE 
    tgrelid = 'media'::regclass;

-- Check for any check constraints on the media table
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM 
    pg_constraint 
WHERE 
    conrelid = 'media'::regclass;

-- Check table structure including any auto-generated columns
\d media