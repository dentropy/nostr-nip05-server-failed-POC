let mah_elements = {
  "nodes": [
    {
      "data": {
        "id": "schema_variable__IPNS_NAME",
        "type": "schema_variables",
        "name": "IPNS_NAME",
        "display_name": "IPNS_NAME"
      }
    },
    {
      "data": {
        "id": "schema_variable__NOSTR_PUBLIC_KEY",
        "type": "schema_variables",
        "name": "NOSTR_PUBLIC_KEY",
        "display_name": "NOSTR_PUBLIC_KEY"
      }
    },
    {
      "data": {
        "id": "schema_variable__DNS_NAME",
        "type": "schema_variables",
        "name": "DNS_NAME",
        "display_name": "DNS_NAME"
      }
    },
    {
      "data": {
        "id": "schema_variable__COUPON_CODE",
        "type": "schema_variables",
        "name": "COUPON_CODE",
        "display_name": "COUPON_CODE"
      }
    },
    {
      "data": {
        "id": "schema_variable__PURCHASE_NUM",
        "type": "schema_variables",
        "name": "PURCHASE_NUM",
        "display_name": "PURCHASE_NUM"
      }
    },
    {
      "data": {
        "id": "schema_variable__LOG_AUTO_INCREMENT",
        "type": "schema_variables",
        "name": "LOG_AUTO_INCREMENT",
        "display_name": "LOG_AUTO_INCREMENT"
      }
    },
    {
      "data": {
        "id": "schema_variable__COUPON_CLAIM_NUMBER",
        "type": "schema_variables",
        "name": "COUPON_CLAIM_NUMBER",
        "display_name": "COUPON_CLAIM_NUMBER"
      }
    },
    {
      "data": {
        "id": "dd_index__root",
        "type": "index",
        "name": "root",
        "display_name": "root"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__namespace_to_ipns",
        "dd_index": "root",
        "type": "key_value_patterns",
        "pattern": "namespace_to_ipns",
        "display_name": "root"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_namespace_to_ipns_index_*",
        "dd_index": "root",
        "type": "key_value_patterns",
        "pattern": "change_log_namespace_to_ipns_index_*",
        "display_name": "root"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_namespace_to_ipns_count",
        "dd_index": "root",
        "type": "key_value_patterns",
        "pattern": "change_log_namespace_to_ipns_count",
        "display_name": "root"
      }
    },
    {
      "data": {
        "id": "dd_index__admin_identities",
        "type": "index",
        "name": "admin_identities",
        "display_name": "admin_identities"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__admin_npub_key_${NOSTR_PUBLIC_KEY}",
        "dd_index": "admin_identities",
        "type": "key_value_patterns",
        "pattern": "admin_npub_key_${NOSTR_PUBLIC_KEY}",
        "display_name": "admin_identities"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_index_${LOG_AUTO_INCREMENT}",
        "dd_index": "admin_identities",
        "type": "key_value_patterns",
        "pattern": "change_log_index_${LOG_AUTO_INCREMENT}",
        "display_name": "admin_identities"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_count",
        "dd_index": "admin_identities",
        "type": "key_value_patterns",
        "pattern": "change_log_count",
        "display_name": "admin_identities"
      }
    },
    {
      "data": {
        "id": "dd_index__nostr_identities",
        "type": "index",
        "name": "nostr_identities",
        "display_name": "nostr_identities"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__user_npub_key_${NOSTR_PUBLIC_KEY}",
        "dd_index": "nostr_identities",
        "type": "key_value_patterns",
        "pattern": "user_npub_key_${NOSTR_PUBLIC_KEY}",
        "display_name": "nostr_identities"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_index_${LOG_AUTO_INCREMENT}",
        "dd_index": "nostr_identities",
        "type": "key_value_patterns",
        "pattern": "change_log_index_${LOG_AUTO_INCREMENT}",
        "display_name": "nostr_identities"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_count",
        "dd_index": "nostr_identities",
        "type": "key_value_patterns",
        "pattern": "change_log_count",
        "display_name": "nostr_identities"
      }
    },
    {
      "data": {
        "id": "dd_index__dns_names",
        "type": "index",
        "name": "dns_names",
        "display_name": "dns_names"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__all_dns_names",
        "dd_index": "dns_names",
        "type": "key_value_patterns",
        "pattern": "all_dns_names",
        "display_name": "dns_names"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__public_dns_names",
        "dd_index": "dns_names",
        "type": "key_value_patterns",
        "pattern": "public_dns_names",
        "display_name": "dns_names"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__default_dns_name",
        "dd_index": "dns_names",
        "type": "key_value_patterns",
        "pattern": "default_dns_name",
        "display_name": "dns_names"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_all_dns_names_json_jq_count",
        "dd_index": "dns_names",
        "type": "key_value_patterns",
        "pattern": "change_log_all_dns_names_json_jq_count",
        "display_name": "dns_names"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_all_dns_names_json_jq_index_${LOG_AUTO_INCREMENT}",
        "dd_index": "dns_names",
        "type": "key_value_patterns",
        "pattern": "change_log_all_dns_names_json_jq_index_${LOG_AUTO_INCREMENT}",
        "display_name": "dns_names"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_public_dns_names_jq_count",
        "dd_index": "dns_names",
        "type": "key_value_patterns",
        "pattern": "change_log_public_dns_names_jq_count",
        "display_name": "dns_names"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_public_dns_names_jq_index_${LOG_AUTO_INCREMENT}",
        "dd_index": "dns_names",
        "type": "key_value_patterns",
        "pattern": "change_log_public_dns_names_jq_index_${LOG_AUTO_INCREMENT}",
        "display_name": "dns_names"
      }
    },
    {
      "data": {
        "id": "dd_index__nostr_dot_json_jq_changes",
        "type": "index",
        "name": "nostr_dot_json_jq_changes",
        "display_name": "nostr_dot_json_jq_changes"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__nostr_json_${DNS_NAME}",
        "dd_index": "nostr_dot_json_jq_changes",
        "type": "key_value_patterns",
        "pattern": "nostr_json_${DNS_NAME}",
        "display_name": "nostr_dot_json_jq_changes"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_${DNS_NAME}_jq_index_${LOG_AUTO_INCREMENT}",
        "dd_index": "nostr_dot_json_jq_changes",
        "type": "key_value_patterns",
        "pattern": "change_log_${DNS_NAME}_jq_index_${LOG_AUTO_INCREMENT}",
        "display_name": "nostr_dot_json_jq_changes"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_${DNS_NAME}_jq_count",
        "dd_index": "nostr_dot_json_jq_changes",
        "type": "key_value_patterns",
        "pattern": "change_log_${DNS_NAME}_jq_count",
        "display_name": "nostr_dot_json_jq_changes"
      }
    },
    {
      "data": {
        "id": "dd_index__coupons",
        "type": "index",
        "name": "coupons",
        "display_name": "coupons"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__coupon_code_${COUPON_CODE}",
        "dd_index": "coupons",
        "type": "key_value_patterns",
        "pattern": "coupon_code_${COUPON_CODE}",
        "display_name": "coupons"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__coupon_claimed_${COUPON_CODE}_${COUPON_CLAIM_NUMBER}",
        "dd_index": "coupons",
        "type": "key_value_patterns",
        "pattern": "coupon_claimed_${COUPON_CODE}_${COUPON_CLAIM_NUMBER}",
        "display_name": "coupons"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_index_${LOG_AUTO_INCREMENT}",
        "dd_index": "coupons",
        "type": "key_value_patterns",
        "pattern": "change_log_index_${LOG_AUTO_INCREMENT}",
        "display_name": "coupons"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_count",
        "dd_index": "coupons",
        "type": "key_value_patterns",
        "pattern": "change_log_count",
        "display_name": "coupons"
      }
    },
    {
      "data": {
        "id": "dd_index__offers",
        "type": "index",
        "name": "offers",
        "display_name": "offers"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__offer_${DNS_NAME}",
        "dd_index": "offers",
        "type": "key_value_patterns",
        "pattern": "offer_${DNS_NAME}",
        "display_name": "offers"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_index_${LOG_AUTO_INCREMENT}",
        "dd_index": "offers",
        "type": "key_value_patterns",
        "pattern": "change_log_index_${LOG_AUTO_INCREMENT}",
        "display_name": "offers"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_count",
        "dd_index": "offers",
        "type": "key_value_patterns",
        "pattern": "change_log_count",
        "display_name": "offers"
      }
    },
    {
      "data": {
        "id": "dd_index__nostr_relays",
        "type": "index",
        "name": "nostr_relays",
        "display_name": "nostr_relays"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__nostr_relay_domain_${DNS_NAME}",
        "dd_index": "nostr_relays",
        "type": "key_value_patterns",
        "pattern": "nostr_relay_domain_${DNS_NAME}",
        "display_name": "nostr_relays"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_${LOG_AUTO_INCREMENT}",
        "dd_index": "nostr_relays",
        "type": "key_value_patterns",
        "pattern": "change_log_${LOG_AUTO_INCREMENT}",
        "display_name": "nostr_relays"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_count",
        "dd_index": "nostr_relays",
        "type": "key_value_patterns",
        "pattern": "change_log_count",
        "display_name": "nostr_relays"
      }
    },
    {
      "data": {
        "id": "dd_index__purchases",
        "type": "index",
        "name": "purchases",
        "display_name": "purchases"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__nostr_relay_domain_${DNS_NAME}",
        "dd_index": "purchases",
        "type": "key_value_patterns",
        "pattern": "nostr_relay_domain_${DNS_NAME}",
        "display_name": "purchases"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__purchase_${PURCHASE_NUM}",
        "dd_index": "purchases",
        "type": "key_value_patterns",
        "pattern": "purchase_${PURCHASE_NUM}",
        "display_name": "purchases"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_${LOG_AUTO_INCREMENT}",
        "dd_index": "purchases",
        "type": "key_value_patterns",
        "pattern": "change_log_${LOG_AUTO_INCREMENT}",
        "display_name": "purchases"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_count",
        "dd_index": "purchases",
        "type": "key_value_patterns",
        "pattern": "change_log_count",
        "display_name": "purchases"
      }
    }
  ],
  "edges": [
    {
      "data": {
        "id": "dd_index__root__TO__key_value_pattern__namespace_to_ipns",
        "source": "dd_index__root",
        "target": "key_value_pattern__namespace_to_ipns",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "dd_index__root__TO__key_value_pattern__change_log_namespace_to_ipns_index_*",
        "source": "dd_index__root",
        "target": "key_value_pattern__change_log_namespace_to_ipns_index_*",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "dd_index__root__TO__key_value_pattern__change_log_namespace_to_ipns_count",
        "source": "dd_index__root",
        "target": "key_value_pattern__change_log_namespace_to_ipns_count",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "dd_index__admin_identities__TO__key_value_pattern__admin_npub_key_${NOSTR_PUBLIC_KEY}",
        "source": "dd_index__admin_identities",
        "target": "key_value_pattern__admin_npub_key_${NOSTR_PUBLIC_KEY}",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__admin_npub_key_${NOSTR_PUBLIC_KEY}__TO__schema_variable__NOSTR_PUBLIC_KEY",
        "source": "key_value_pattern__admin_npub_key_${NOSTR_PUBLIC_KEY}",
        "target": "schema_variable__NOSTR_PUBLIC_KEY",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "dd_index__admin_identities__TO__key_value_pattern__change_log_index_${LOG_AUTO_INCREMENT}",
        "source": "dd_index__admin_identities",
        "target": "key_value_pattern__change_log_index_${LOG_AUTO_INCREMENT}",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_index_${LOG_AUTO_INCREMENT}__TO__schema_variable__LOG_AUTO_INCREMENT",
        "source": "key_value_pattern__change_log_index_${LOG_AUTO_INCREMENT}",
        "target": "schema_variable__LOG_AUTO_INCREMENT",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "dd_index__admin_identities__TO__key_value_pattern__change_log_count",
        "source": "dd_index__admin_identities",
        "target": "key_value_pattern__change_log_count",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "dd_index__nostr_identities__TO__key_value_pattern__user_npub_key_${NOSTR_PUBLIC_KEY}",
        "source": "dd_index__nostr_identities",
        "target": "key_value_pattern__user_npub_key_${NOSTR_PUBLIC_KEY}",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__user_npub_key_${NOSTR_PUBLIC_KEY}__TO__schema_variable__NOSTR_PUBLIC_KEY",
        "source": "key_value_pattern__user_npub_key_${NOSTR_PUBLIC_KEY}",
        "target": "schema_variable__NOSTR_PUBLIC_KEY",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "dd_index__nostr_identities__TO__key_value_pattern__change_log_index_${LOG_AUTO_INCREMENT}",
        "source": "dd_index__nostr_identities",
        "target": "key_value_pattern__change_log_index_${LOG_AUTO_INCREMENT}",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_index_${LOG_AUTO_INCREMENT}__TO__schema_variable__LOG_AUTO_INCREMENT",
        "source": "key_value_pattern__change_log_index_${LOG_AUTO_INCREMENT}",
        "target": "schema_variable__LOG_AUTO_INCREMENT",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "dd_index__nostr_identities__TO__key_value_pattern__change_log_count",
        "source": "dd_index__nostr_identities",
        "target": "key_value_pattern__change_log_count",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "dd_index__dns_names__TO__key_value_pattern__all_dns_names",
        "source": "dd_index__dns_names",
        "target": "key_value_pattern__all_dns_names",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "dd_index__dns_names__TO__key_value_pattern__public_dns_names",
        "source": "dd_index__dns_names",
        "target": "key_value_pattern__public_dns_names",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "dd_index__dns_names__TO__key_value_pattern__default_dns_name",
        "source": "dd_index__dns_names",
        "target": "key_value_pattern__default_dns_name",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "dd_index__dns_names__TO__key_value_pattern__change_log_all_dns_names_json_jq_count",
        "source": "dd_index__dns_names",
        "target": "key_value_pattern__change_log_all_dns_names_json_jq_count",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "dd_index__dns_names__TO__key_value_pattern__change_log_all_dns_names_json_jq_index_${LOG_AUTO_INCREMENT}",
        "source": "dd_index__dns_names",
        "target": "key_value_pattern__change_log_all_dns_names_json_jq_index_${LOG_AUTO_INCREMENT}",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_all_dns_names_json_jq_index_${LOG_AUTO_INCREMENT}__TO__schema_variable__LOG_AUTO_INCREMENT",
        "source": "key_value_pattern__change_log_all_dns_names_json_jq_index_${LOG_AUTO_INCREMENT}",
        "target": "schema_variable__LOG_AUTO_INCREMENT",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "dd_index__dns_names__TO__key_value_pattern__change_log_public_dns_names_jq_count",
        "source": "dd_index__dns_names",
        "target": "key_value_pattern__change_log_public_dns_names_jq_count",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "dd_index__dns_names__TO__key_value_pattern__change_log_public_dns_names_jq_index_${LOG_AUTO_INCREMENT}",
        "source": "dd_index__dns_names",
        "target": "key_value_pattern__change_log_public_dns_names_jq_index_${LOG_AUTO_INCREMENT}",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_public_dns_names_jq_index_${LOG_AUTO_INCREMENT}__TO__schema_variable__LOG_AUTO_INCREMENT",
        "source": "key_value_pattern__change_log_public_dns_names_jq_index_${LOG_AUTO_INCREMENT}",
        "target": "schema_variable__LOG_AUTO_INCREMENT",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "dd_index__nostr_dot_json_jq_changes__TO__key_value_pattern__nostr_json_${DNS_NAME}",
        "source": "dd_index__nostr_dot_json_jq_changes",
        "target": "key_value_pattern__nostr_json_${DNS_NAME}",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__nostr_json_${DNS_NAME}__TO__schema_variable__DNS_NAME",
        "source": "key_value_pattern__nostr_json_${DNS_NAME}",
        "target": "schema_variable__DNS_NAME",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "dd_index__nostr_dot_json_jq_changes__TO__key_value_pattern__change_log_${DNS_NAME}_jq_index_${LOG_AUTO_INCREMENT}",
        "source": "dd_index__nostr_dot_json_jq_changes",
        "target": "key_value_pattern__change_log_${DNS_NAME}_jq_index_${LOG_AUTO_INCREMENT}",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_${DNS_NAME}_jq_index_${LOG_AUTO_INCREMENT}__TO__schema_variable__DNS_NAME",
        "source": "key_value_pattern__change_log_${DNS_NAME}_jq_index_${LOG_AUTO_INCREMENT}",
        "target": "schema_variable__DNS_NAME",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_${DNS_NAME}_jq_index_${LOG_AUTO_INCREMENT}__TO__schema_variable__LOG_AUTO_INCREMENT",
        "source": "key_value_pattern__change_log_${DNS_NAME}_jq_index_${LOG_AUTO_INCREMENT}",
        "target": "schema_variable__LOG_AUTO_INCREMENT",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "dd_index__nostr_dot_json_jq_changes__TO__key_value_pattern__change_log_${DNS_NAME}_jq_count",
        "source": "dd_index__nostr_dot_json_jq_changes",
        "target": "key_value_pattern__change_log_${DNS_NAME}_jq_count",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_${DNS_NAME}_jq_count__TO__schema_variable__DNS_NAME",
        "source": "key_value_pattern__change_log_${DNS_NAME}_jq_count",
        "target": "schema_variable__DNS_NAME",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "dd_index__coupons__TO__key_value_pattern__coupon_code_${COUPON_CODE}",
        "source": "dd_index__coupons",
        "target": "key_value_pattern__coupon_code_${COUPON_CODE}",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__coupon_code_${COUPON_CODE}__TO__schema_variable__COUPON_CODE",
        "source": "key_value_pattern__coupon_code_${COUPON_CODE}",
        "target": "schema_variable__COUPON_CODE",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "dd_index__coupons__TO__key_value_pattern__coupon_claimed_${COUPON_CODE}_${COUPON_CLAIM_NUMBER}",
        "source": "dd_index__coupons",
        "target": "key_value_pattern__coupon_claimed_${COUPON_CODE}_${COUPON_CLAIM_NUMBER}",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__coupon_claimed_${COUPON_CODE}_${COUPON_CLAIM_NUMBER}__TO__schema_variable__COUPON_CODE",
        "source": "key_value_pattern__coupon_claimed_${COUPON_CODE}_${COUPON_CLAIM_NUMBER}",
        "target": "schema_variable__COUPON_CODE",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__coupon_claimed_${COUPON_CODE}_${COUPON_CLAIM_NUMBER}__TO__schema_variable__COUPON_CLAIM_NUMBER",
        "source": "key_value_pattern__coupon_claimed_${COUPON_CODE}_${COUPON_CLAIM_NUMBER}",
        "target": "schema_variable__COUPON_CLAIM_NUMBER",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "dd_index__coupons__TO__key_value_pattern__change_log_index_${LOG_AUTO_INCREMENT}",
        "source": "dd_index__coupons",
        "target": "key_value_pattern__change_log_index_${LOG_AUTO_INCREMENT}",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_index_${LOG_AUTO_INCREMENT}__TO__schema_variable__LOG_AUTO_INCREMENT",
        "source": "key_value_pattern__change_log_index_${LOG_AUTO_INCREMENT}",
        "target": "schema_variable__LOG_AUTO_INCREMENT",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "dd_index__coupons__TO__key_value_pattern__change_log_count",
        "source": "dd_index__coupons",
        "target": "key_value_pattern__change_log_count",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "dd_index__offers__TO__key_value_pattern__offer_${DNS_NAME}",
        "source": "dd_index__offers",
        "target": "key_value_pattern__offer_${DNS_NAME}",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__offer_${DNS_NAME}__TO__schema_variable__DNS_NAME",
        "source": "key_value_pattern__offer_${DNS_NAME}",
        "target": "schema_variable__DNS_NAME",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "dd_index__offers__TO__key_value_pattern__change_log_index_${LOG_AUTO_INCREMENT}",
        "source": "dd_index__offers",
        "target": "key_value_pattern__change_log_index_${LOG_AUTO_INCREMENT}",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_index_${LOG_AUTO_INCREMENT}__TO__schema_variable__LOG_AUTO_INCREMENT",
        "source": "key_value_pattern__change_log_index_${LOG_AUTO_INCREMENT}",
        "target": "schema_variable__LOG_AUTO_INCREMENT",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "dd_index__offers__TO__key_value_pattern__change_log_count",
        "source": "dd_index__offers",
        "target": "key_value_pattern__change_log_count",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "dd_index__nostr_relays__TO__key_value_pattern__nostr_relay_domain_${DNS_NAME}",
        "source": "dd_index__nostr_relays",
        "target": "key_value_pattern__nostr_relay_domain_${DNS_NAME}",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__nostr_relay_domain_${DNS_NAME}__TO__schema_variable__DNS_NAME",
        "source": "key_value_pattern__nostr_relay_domain_${DNS_NAME}",
        "target": "schema_variable__DNS_NAME",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "dd_index__nostr_relays__TO__key_value_pattern__change_log_${LOG_AUTO_INCREMENT}",
        "source": "dd_index__nostr_relays",
        "target": "key_value_pattern__change_log_${LOG_AUTO_INCREMENT}",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_${LOG_AUTO_INCREMENT}__TO__schema_variable__LOG_AUTO_INCREMENT",
        "source": "key_value_pattern__change_log_${LOG_AUTO_INCREMENT}",
        "target": "schema_variable__LOG_AUTO_INCREMENT",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "dd_index__nostr_relays__TO__key_value_pattern__change_log_count",
        "source": "dd_index__nostr_relays",
        "target": "key_value_pattern__change_log_count",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "dd_index__purchases__TO__key_value_pattern__nostr_relay_domain_${DNS_NAME}",
        "source": "dd_index__purchases",
        "target": "key_value_pattern__nostr_relay_domain_${DNS_NAME}",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__nostr_relay_domain_${DNS_NAME}__TO__schema_variable__DNS_NAME",
        "source": "key_value_pattern__nostr_relay_domain_${DNS_NAME}",
        "target": "schema_variable__DNS_NAME",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "dd_index__purchases__TO__key_value_pattern__purchase_${PURCHASE_NUM}",
        "source": "dd_index__purchases",
        "target": "key_value_pattern__purchase_${PURCHASE_NUM}",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__purchase_${PURCHASE_NUM}__TO__schema_variable__PURCHASE_NUM",
        "source": "key_value_pattern__purchase_${PURCHASE_NUM}",
        "target": "schema_variable__PURCHASE_NUM",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "dd_index__purchases__TO__key_value_pattern__change_log_${LOG_AUTO_INCREMENT}",
        "source": "dd_index__purchases",
        "target": "key_value_pattern__change_log_${LOG_AUTO_INCREMENT}",
        "display_name": "index_to_kvp"
      }
    },
    {
      "data": {
        "id": "key_value_pattern__change_log_${LOG_AUTO_INCREMENT}__TO__schema_variable__LOG_AUTO_INCREMENT",
        "source": "key_value_pattern__change_log_${LOG_AUTO_INCREMENT}",
        "target": "schema_variable__LOG_AUTO_INCREMENT",
        "display_name": "kbp_to_schema_variable"
      }
    },
    {
      "data": {
        "id": "dd_index__purchases__TO__key_value_pattern__change_log_count",
        "source": "dd_index__purchases",
        "target": "key_value_pattern__change_log_count",
        "display_name": "index_to_kvp"
      }
    }
  ]
}