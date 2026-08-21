
UPDATE public.products SET images = ARRAY['/__l5e/assets-v1/00fadffc-04bd-4874-b2b9-d51345ff1b56/image-10.png'] WHERE slug = 'chill-god';

INSERT INTO public.products (name, slug, category, description, price_usd, vat_percent, shipping_usd, discount_percent, images, colors, badge, sort_order) VALUES
('Anti Social Graphic Tee','anti-social','T-Shirts','"Offline is the new peace of mind." Layered varsity lettering in red and blue on heavyweight black cotton.',18.75,7.5,5,10,ARRAY['/__l5e/assets-v1/2585c496-3a74-4ebd-910c-cf024f489d72/image-6.png'],ARRAY['Black','Red','Blue'],'BESTSELLER',6),
('Steeze Department Tee','steeze-dept','T-Shirts','White heavyweight tee with the red Steeze Department chest emblem. Ribbed collar, side-seamed body.',18.75,7.5,5,0,ARRAY['/__l5e/assets-v1/93767b1b-7565-4e3a-a021-3c7fd727fe01/image-7.png','/__l5e/assets-v1/b8cf6ff9-510c-4796-ad97-270bd177b255/image-8.png'],ARRAY['White','Red'],NULL,7),
('Stay Steezed Statement Tee','stay-steezed','T-Shirts','Oversized back typography: "Stay steezed until death, defeat is a state of mind."',18.75,7.5,5,0,ARRAY['/__l5e/assets-v1/b8cf6ff9-510c-4796-ad97-270bd177b255/image-8.png','/__l5e/assets-v1/93767b1b-7565-4e3a-a021-3c7fd727fe01/image-7.png'],ARRAY['White'],'NEW',8),
('Night Shift Society Tee','night-shift','T-Shirts','Photographic city-night print framed in chain detail with script lettering.',18.75,7.5,5,0,ARRAY['/__l5e/assets-v1/878ae6d9-5af7-4f8f-82e0-db6a9b8db638/image-9.png'],ARRAY['Black'],NULL,9);

INSERT INTO public.gallery (image_url, title, description, sort_order) VALUES
('/__l5e/assets-v1/6d75f760-7900-4c59-b985-bd1bbebeac39/image-3.png','Freedom','Warped lilac typography, shot in studio daylight.',1),
('/__l5e/assets-v1/820c4c70-638e-4d4c-a4fc-a3c87259c205/image-5.png','Character Crop','Hand-illustrated graphic on a cropped silhouette.',2),
('/__l5e/assets-v1/2585c496-3a74-4ebd-910c-cf024f489d72/image-6.png','Anti Social','Varsity layers in red and blue.',3),
('/__l5e/assets-v1/878ae6d9-5af7-4f8f-82e0-db6a9b8db638/image-9.png','Night Shift','When the sun leaves, the city speaks.',4);
