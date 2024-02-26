* root
    * Desciption: The data required to use the application
    * Keys:
        * key_value_patterns
        * namespace_to_ipns
        * change_log_namespace_to_ipns_${ZERO_PADDED_CHANGE_NUMBER}
        * change_log_namespace_to_ipns_count
* reference_cids
    * Description: None of the indexes below actually store JSON, they store CIDs, these CIDs need to be looked up on another server or the file system
    * Keys:
        * key_value_patterns
        * ${CID}
* cids
    * Description: None of the indexes below actually store JSON, they store CIDs
    * Keys:
        * key_value_patterns
        * ${CID}
* admin_identities
    * Description: Returns a list of nostr NIP05 DIDs that can manage this server
    * Index Features:
        * Use LevelDB key for Nostr DIDs
        * change_log_${ZERO_PADDED_CHANGE_NUMBER}
        * change_log_count
    * Keys:
        * key_value_patterns
        * admin_npub_key_${NOSTR_NPUB_KEY}
        * change_log_${ZERO_PADDED_CHANGE_NUMBER}
        * change_log_count
* nostr_identities
    * Description: Returns list of nostr npub keys registed on this NIP05 server
    * Index Features:
        * Use LevelDB key for Nostr DIDs
    * Keys:
        * key_value_patterns
        * user_npub_key_${NOSTR_NPUB_KEY}
        * change_log_index${ZERO_PADDED_CHANGE_NUMBER}
        * change_log_count
* dns_names
    * Description: Stores DNS names configured to work with this NIP05 server
    * IndexFeatures:
        * Return a singlke JSON blob of the DNS names
        * Version control history of JSON Blob
    * Keys
        * key_value_patterns
        * all_dns_names
            * Description: Returns a list of public DNS names
        * public_dns_names
            * Description: Reutrns all DNS names that have been inserted
        * change_log_all_dns_names_json_jq_count
        * change_log_all_dns_names_json_jq_index_${ZERO_PADDED_CHANGE_NUMBER}
            * Description: Previously registered DNS names should not be forgotten
        * change_log_public_dns_names_jq_count
        * change_log_public_dns_names_jq_index_${ZERO_PADDED_CHANGE_NUMBER}
            * Description: The DNS names that are returned on the public API
* nostr_dot_json_jq_changes
    * Description: Changes done to nostr.json file and who did them
    * IndexFeatures:
        * Return single JSON blob for each DNS server
        * Incremented change index for each DNS server
    * Keys:
        * key_value_patterns
        * nostr_json_${DNS_NAME}
        * change_log_${DNS_NAME}_jq_${ZERO_PADDED_CHANGE_NUMBER}
        * change_log_count
* coupons
    * Description: Have a bunch of coupon codes that can redeem based on specific domain names
    * Keys:
        * key_value_patterns
        * coupon_code_${COUPON_CODE}
            * Description: All coupon codes should be here
        * coupon_valid_${COUPON_CODE}
        * coupon_claimed_${COUPON_CODE}_${ZERO_PADDED_CLAIM_NUMBER}
        * coupon_removed_${COUPON_CODE}
        * change_log_${ZERO_PADDED_CHANGE_NUMBER}
        * change_log_count
* offers
    * Description: How much each DNS identity costs to buy
    * Keys:
        * key_value_patterns
        * offer_${DNS_NAME}
        * change_log_index_${ZERO_PADDED_CHANGE_NUMBER}
        * change_log_count
* nostr_relays
    * Description: List of nostr relays referenced
    * Keys:
        * key_value_patterns
        * nostr_relay_domain_${WEBSOCKET_TYPE}_${RELAY_DOMAIN_NAME}
        * change_log_${ZERO_PADDED_CHANGE_NUMBER}
        * change_log_count
* purchases
    * Description:
        * Keep track of all the previous purchases
    * Keys:
        * key_value_patterns
        * purchase_${PURCHASE_NUM}
        * change_log_${ZERO_PADDED_CHANGE_NUMBER}
        * change_log_count
