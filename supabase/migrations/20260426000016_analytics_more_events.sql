-- Adds form-specific event types for donation requests and account signup
-- abandonment, so we can track each form independently.
alter type analytics_event_type add value if not exists 'donation_form_open';
alter type analytics_event_type add value if not exists 'donation_form_step';
alter type analytics_event_type add value if not exists 'donation_form_abandon';
alter type analytics_event_type add value if not exists 'account_signup_abandon';
