-- =====================================================================
-- Dispatch Intake — seed data for local / staging
-- Run AFTER schema.sql, AFTER you've created at least one auth user.
-- For pure in-app demo mode, lib/mockData.ts mirrors this shape.
-- =====================================================================

-- Example: upsert profiles (replace UUIDs with real auth.users ids)
-- insert into public.profiles (id, full_name, email, role) values
--   ('00000000-0000-0000-0000-000000000001', 'Alex Rivera',  'alex@dispatch.co',  'admin'),
--   ('00000000-0000-0000-0000-000000000002', 'Morgan Lee',   'morgan@dispatch.co','dispatcher'),
--   ('00000000-0000-0000-0000-000000000003', 'Sam Patel',    'sam@dispatch.co',   'sales_rep')
-- on conflict (id) do nothing;

insert into public.dispatch_intakes (
  caller_name, caller_phone, caller_email, company_name,
  pickup_location, delivery_location, load_type, trailer_type,
  weight, pickup_date, urgency, special_instructions,
  call_summary, transcript, recommended_action, missing_fields,
  priority_score, intake_status, source,
  elevenlabs_call_id, make_execution_id, call_timestamp, created_at
) values
(
  'John Smith', '5551234567', 'johnsmith@example.com', 'Smith Logistics',
  'Atlanta, GA', 'Nashville, TN', 'Dry Van', '53 ft dry van',
  '18000 lbs', '2026-04-19', 'high', 'Needs pickup before noon.',
  'Caller requested dispatch help for a same-day dry van load from Atlanta to Nashville.',
  'Agent: Thanks for calling Dispatch Intake. Caller: Hi, I need a truck today...',
  'Confirm pickup window and quote rate within 30 minutes.',
  '[]'::jsonb, 82, 'new', 'elevenlabs_dispatch_agent',
  'elv_call_001', 'make_exec_001', now() - interval '20 minutes', now() - interval '20 minutes'
),
(
  'Dana Wu', '5559870011', 'dana@coldchain.io', 'ColdChain Freight',
  'Dallas, TX', 'Phoenix, AZ', 'Reefer', '53 ft reefer',
  '32000 lbs', '2026-04-21', 'critical', 'Must maintain 34F, driver must have PPE.',
  'Temperature-sensitive pharma load. Caller needs dedicated reefer with team drivers.',
  'Agent: How cold does this need to stay? Caller: Thirty-four degrees...',
  'Flag for ops manager. Confirm team drivers available.',
  '["insurance_certificate"]'::jsonb, 95, 'new', 'elevenlabs_dispatch_agent',
  'elv_call_002', 'make_exec_002', now() - interval '2 hours', now() - interval '2 hours'
),
(
  'Marcus Hall', '5553330099', null, 'Hall Brothers Hauling',
  'Kansas City, MO', 'Denver, CO', 'Flatbed', '48 ft flatbed',
  '44000 lbs', '2026-04-22', 'normal', 'Tarp required.',
  'Standard flatbed move. Caller has worked with us twice previously.',
  'Agent: Do you need tarping? Caller: Yeah, steel coils...',
  'Quote by EOD. Possible repeat customer discount.',
  '["caller_email"]'::jsonb, 60, 'contacted', 'elevenlabs_dispatch_agent',
  'elv_call_003', 'make_exec_003', now() - interval '1 day', now() - interval '1 day'
),
(
  'Priya Desai', '5557772244', 'priya@novaship.com', 'NovaShip',
  'Newark, NJ', 'Boston, MA', 'LTL', 'Box truck',
  '3500 lbs', '2026-04-18', 'high', 'Liftgate needed at delivery.',
  'Short-haul LTL with liftgate requirement. Asking about same-day quote.',
  'Agent: Any special equipment? Caller: Yes, liftgate at delivery...',
  'Provide liftgate-qualified carrier list. Respond with quote today.',
  '[]'::jsonb, 74, 'quoted', 'elevenlabs_dispatch_agent',
  'elv_call_004', 'make_exec_004', now() - interval '4 hours', now() - interval '4 hours'
),
(
  'Chris OBrien', '5554442211', 'chris@obrien.co', 'OBrien Hauling',
  'Seattle, WA', 'Portland, OR', 'Dry Van', '26 ft box',
  '9000 lbs', '2026-04-23', 'low', null,
  'Customer wants to schedule recurring weekly runs.',
  'Agent: How often do you need this move? Caller: Every Friday...',
  'Schedule follow-up next Monday to confirm contract.',
  '[]'::jsonb, 45, 'booked', 'elevenlabs_dispatch_agent',
  'elv_call_005', 'make_exec_005', now() - interval '2 days', now() - interval '2 days'
),
(
  'Jordan Peters', '5552228800', null, null,
  null, 'Miami, FL', null, null,
  null, null, 'normal', null,
  'Caller dropped off mid-call. Partial info captured.',
  'Agent: Can you confirm your pickup city? [line disconnected]',
  'Attempt callback within 1 hour.',
  '["caller_email","company_name","pickup_location","load_type","pickup_date"]'::jsonb,
  30, 'incomplete', 'elevenlabs_dispatch_agent',
  'elv_call_006', 'make_exec_006', now() - interval '30 minutes', now() - interval '30 minutes'
)
on conflict do nothing;
