--
-- PostgreSQL database dump
--

\restrict WjyEBWkJ47R0RMvekholYLfj7HaKekShxHDLMmoDGlYqBbklDAhRHM2473j8x7h

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2025-10-31 10:49:16

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16563)
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    text_content text,
    image_url character varying(255),
    created_at timestamp with time zone DEFAULT now(),
    author_id integer NOT NULL
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16562)
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.posts_id_seq OWNER TO postgres;

--
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 221
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- TOC entry 220 (class 1259 OID 16545)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16544)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4985 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4817 (class 2604 OID 16566)
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- TOC entry 4814 (class 2604 OID 16548)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4978 (class 0 OID 16563)
-- Dependencies: 222
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts (id, text_content, image_url, created_at, author_id) FROM stdin;
32	Ngapain kek Udah Gede Juga	/uploads/1761878909334-wkwkwkw.png	2025-10-31 09:48:30.044252+07	3
\.


--
-- TOC entry 4976 (class 0 OID 16545)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, is_admin, created_at) FROM stdin;
1	DimasHammam	xoix775@gmail.com	$2b$10$kaILNoNH1CFK6uhDX/gw..HK/udKLnumsyXU01TaXlAliVVaDlYpK	t	2025-10-30 13:14:18.231246+07
3	UserOpokek	testes@gmail.com	$2b$10$7PZikagxvNpY3NHQmUnRReyL2ve1wIoYjtcJu930.8yvQMpKRZ4YK	f	2025-10-31 06:09:36.883082+07
4	yuri	yuridazani.personal@gmail.com	$2b$10$yy1OEzjwQFRifyC8.fI7U.RTHPDj86wcyi.qaceNHm0zjfNSWXXSq	f	2025-10-31 09:52:39.489563+07
\.


--
-- TOC entry 4986 (class 0 OID 0)
-- Dependencies: 221
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.posts_id_seq', 32, true);


--
-- TOC entry 4987 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- TOC entry 4826 (class 2606 OID 16573)
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- TOC entry 4820 (class 2606 OID 16561)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4822 (class 2606 OID 16557)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4824 (class 2606 OID 16559)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4827 (class 2606 OID 16574)
-- Name: posts fk_author; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT fk_author FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-10-31 10:49:16

--
-- PostgreSQL database dump complete
--

\unrestrict WjyEBWkJ47R0RMvekholYLfj7HaKekShxHDLMmoDGlYqBbklDAhRHM2473j8x7h

