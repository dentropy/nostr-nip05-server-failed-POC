CREATE TABLE IF NOT EXISTS admin_t (
	nostr_key_hex  TEXT UNIQUE,
	nostr_key_npub TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS server_nostr_identities_t (
	nostr_key_hex TEXT UNIQUE,
	nostr_key_npub TEXT UNIQUE,
	private_key TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS dns_names_t (
	dns_name TEXT UNIQUE,
	share BOOLEAN,
	is_configured BOOLEAN
);

CREATE TABLE IF NOT EXISTS coupons_codes_t (
	coupon_code TEXT UNIQUE,
	claimed BOOLEAN
);

CREATE TABLE IF NOT EXISTS coupon_domains_t (
	coupon_code TEXT UNIQUE,
	dns_name TEXT UNIQUE,
	FOREIGN KEY (coupon_code) REFERENCES coupons_codes_t(coupon_code),
	FOREIGN KEY (dns_name) REFERENCES dns_names_t(dns_name)
);

CREATE TABLE IF NOT EXISTS offers_t (
	dns_name  TEXT,
	price INT,
	blockchain_id TEXT,
	token_id TEXT,
	valid BOOLEAN,
	FOREIGN KEY (dns_name) REFERENCES dns_names_t(dns_name)
);


CREATE TABLE IF NOT EXISTS purchases_t (
	paid_amount INT,
	blockchain_id TEXT,
	token_id TEXT,
	transaction_hash TEXT
);

CREATE TABLE IF NOT EXISTS nostr_identitys (
	nostr_key_hex  TEXT UNIQUE,
	nostr_key_npub TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS nostr_relays (
	relay_url TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS nostr_jq_json_changes_t (
	jq_change_id INTEGER PRIMARY KEY AUTOINCREMENT,
	jq_command TEXT,
	resulting_raw_json TEXT
);