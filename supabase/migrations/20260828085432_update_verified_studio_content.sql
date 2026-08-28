update public.studio_artists
set slug = 'kartik', name = 'Kartik', role = 'Tattoo Artist',
    bio = 'Kartik approaches every tattoo as a collaboration. He listens closely, develops a composition around the client idea and placement, and brings a calm, detail-led presence to the entire process.',
    updated_at = now()
where slug = 'vishal';

update public.studio_artists
set slug = 'sachin', name = 'Sachin', role = 'Tattoo Artist',
    bio = 'Sachin is drawn to structured, visually balanced tattooing. His process focuses on proportion, placement and clean execution so each piece feels intentional on the body.',
    updated_at = now()
where slug = 'aarav';

update public.studio_artists
set slug = 'manish', name = 'Manish', role = 'Tattoo Artist',
    bio = 'Manish brings a patient, thoughtful approach to personal tattoo ideas. He works with clients to simplify references into clear, wearable designs with a strong sense of flow.',
    updated_at = now()
where slug = 'mira';
