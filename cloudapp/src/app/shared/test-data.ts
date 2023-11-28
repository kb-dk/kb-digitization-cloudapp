export const HOLDING = {
    "holding_id": "222078730910005763",
    "created_by": "System",
    "created_date": "2019-11-18Z",
    "last_modified_by": "sipm",
    "last_modified_date": "2023-11-24Z",
    "originating_system": "45KBDK_KGL",
    "originating_system_id": "222078730910005763",
    "suppress_from_publishing": "false",
    "calculated_suppress_from_publishing": "false",
    "anies": [
        "<?xml version=\"1.0\" encoding=\"UTF-16\"?><record><leader>00204nx  a22000851n 4500</leader><controlfield tag=\"008\">1011252u    8   4001uueng0000000</controlfield><controlfield tag=\"005\">20231124095020.0</controlfield><datafield ind1=\" \" ind2=\" \" tag=\"583\"><subfield code=\"x\">NKS-4_2740_1</subfield></datafield><datafield ind1=\" \" ind2=\" \" tag=\"583\"><subfield code=\"x\">NKS-4_2740_2</subfield></datafield><datafield ind1=\"8\" ind2=\" \" tag=\"852\"><subfield code=\"b\">KBL</subfield><subfield code=\"c\">LFHABBOX</subfield><subfield code=\"h\">NKS 2740 kvart</subfield></datafield></record>"
    ]
}

export const HOLDINGWITHMULTI583X = {
    "holding_id": "222099563260005763",
    "created_by": "System",
    "created_date": "2019-12-16Z",
    "last_modified_by": "TLR",
    "last_modified_date": "2023-09-21Z",
    "originating_system": "ILS",
    "originating_system_id": "012053104000010-HOL-KGL50",
    "suppress_from_publishing": "false",
    "calculated_suppress_from_publishing": "false",
    "anies": [
        "<?xml version=\"1.0\" encoding=\"UTF-16\"?><record><leader>00213nx  a22000731i 4500</leader><controlfield tag=\"008\">1910192u    8   4001uueng0000000</controlfield><controlfield tag=\"005\">20230921105412.0</controlfield><datafield ind1=\" \" ind2=\" \" tag=\"583\"><subfield code=\"x\">NKS-4_2740_1</subfield></datafield><datafield ind1=\" \" ind2=\" \" tag=\"583\"><subfield code=\"x\">NKS-4_2740_2</subfield></datafield><datafield ind1=\"8\" ind2=\" \" tag=\"852\"><subfield code=\"b\">KBL</subfield><subfield code=\"c\">LFKOBKBS</subfield><subfield code=\"h\">KBK 1111,251,3-22a-1979-1983 1984-24/17</subfield></datafield></record>"
    ]
}

export const USER_REQUEST = {
    "user_request": [
        {
            "title": "Oversigtskort over egnen omkring Hornbæk, Esbønderup og Helsingør / NESA.",
            "volume": "",
            "issue": "",
            "part": "",
            "barcode": "201003953560",
            "request_id": "48735562880005763",
            "additional_id": "6288",
            "request_type": "WORK_ORDER",
            "request_sub_type": {
                "value": "Digiproj",
                "desc": "Projektdigitalisering"
            },
            "mms_id": "99122912149905763",
            "managed_by_library": "",
            "managed_by_circulation_desk": "",
            "managed_by_library_code": "",
            "managed_by_circulation_desk_code": "",
            "target_destination": {
                "value": "Digiproj_1008",
                "desc": "10008-Pligtafl. kort"
            },
            "material_type": {
                "value": "MAP",
                "desc": "Map"
            },
            "date_of_publication": "",
            "request_status": "IN_PROCESS",
            "request_date": "2023-11-02Z",
            "request_time": "2023-11-02T11:06:09.270Z",
            "task_name": "In Process",
            "expiry_date": "2023-11-09Z",
            "item_id": "231971969210005763"
        }
    ],
    "total_record_count": 1
}

export const INIT_DATA = {
    "user": {
        "firstName": "user_name",
        "lastName": "user_last_name",
        "primaryId": "user_id",
        "currentlyAtLibCode": "45KBDK_KGL",
        "currentlyAtDept": "Digiproj_1008",
        "isAdmin": false
    },
    "lang": "en",
    "instCode": "45KBDK_KGL",
    "urls": {
        "alma": "http://localhost:4200/",
        "primo": "https://primo.exlibrisgroup.com"
    },
    "color": "green"
}

export const EMPTY_CONFIG = {}

export const CONFIG = {
    "serviceUrl": "https://blabla_test.kb.dk/api/",
    "apiKey": "api_key_bla_bla",
    "paramNames": [
        "field[project_id]",
        "field[customer_id]",
        "field[job_id]",
        "field[step_id]"
    ],
    "desks": [
        {
            "deskName": "Lindhardt og Ringhof - København",
            "deskCode": "DIGI_L-og-R_Kbh",
            "workOrderType": "Digiproj",
            "maestroStartStep": "KBH bog oprettet",
            "maestroFinishStep": "KBH Bog modtages (KAT)",
            "multiform": "",
            "frakture": "",
            "showTitle": "",
            "useMarcField": "",
            "removeTempLocation": "",
            "params": [
                {
                    "key": null,
                    "value": "31"
                },
                {
                    "key": null,
                    "value": "7"
                },
                {
                    "key": null,
                    "value": "48"
                },
                {
                    "key": null,
                    "value": "25"
                }
            ]
        },
        {
            "deskName": "Lindhardt og Ringhof uden Alma publicering_10068",
            "deskCode": "Digiproj_10068",
            "workOrderType": "Digiproj",
            "maestroStartStep": "KBH bog oprettet",
            "maestroFinishStep": "KBH Bog returnere",
            "multiform": "",
            "frakture": "",
            "showTitle": "",
            "useMarcField": "",
            "removeTempLocation": "",
            "params": [
                {
                    "key": "field[project_id]",
                    "value": "9"
                },
                {
                    "key": "field[customer_id]",
                    "value": "7"
                },
                {
                    "key": "field[job_id]",
                    "value": "49"
                },
                {
                    "key": "field[step_id]",
                    "value": "25"
                }
            ]
        },
        {
            "deskName": "The Black Diamond, Copenhagen - Nationalbibliotekets digitalisering",
            "deskCode": "DIGINAT",
            "workOrderType": "",
            "maestroStartStep": "KBH bog oprettet",
            "maestroFinishStep": "KBH Bog modtages (KAT)",
            "multiform": true,
            "frakture": true,
            "showTitle": "",
            "useMarcField": "",
            "removeTempLocation": true,
            "params": [
                {
                    "key": "field[project_id]",
                    "value": "3"
                },
                {
                    "key": "field[customer_id]",
                    "value": "2"
                },
                {
                    "key": "field[job_id]",
                    "value": "32"
                },
                {
                    "key": "field[step_id]",
                    "value": "25"
                }
            ]
        },
        {
            "deskName": "Arkitekturtegninger Adhoc_10020",
            "deskCode": "Digiproj_10020",
            "workOrderType": "Digiproj",
            "maestroStartStep": "KBH billedværk oprettet",
            "maestroFinishStep": "KBH billedværk modtages (SAMLINGS-EJER)",
            "multiform": true,
            "frakture": true,
            "showTitle": true,
            "useMarcField": true,
            "removeTempLocation": "",
            "params": [
                {
                    "key": "field[project_id]",
                    "value": "37"
                },
                {
                    "key": "field[customer_id]",
                    "value": "20"
                },
                {
                    "key": "field[job_id]",
                    "value": "54"
                },
                {
                    "key": "field[step_id]",
                    "value": "69"
                }
            ]
        },
        {
            "deskName": "Pligtafl. kort_10008",
            "deskCode": "Digiproj_1008",
            "workOrderType": "Digiproj",
            "maestroStartStep": "KBH billedværk oprettet",
            "maestroFinishStep": "KBH billedværk modtages (SAMLINGS-EJER)",
            "multiform": "",
            "frakture": "",
            "showTitle": true,
            "useMarcField": true,
            "removeTempLocation": "",
            "params": [
                {
                    "key": "field[project_id]",
                    "value": "40"
                },
                {
                    "key": "field[customer_id]",
                    "value": "10"
                },
                {
                    "key": "field[job_id]",
                    "value": "59"
                },
                {
                    "key": "field[step_id]",
                    "value": "69"
                }
            ]
        },
        {
            "deskName": "Atelierbestilling_Billeder_10006",
            "deskCode": "Digiproj_10006_B",
            "workOrderType": "Digiproj",
            "maestroStartStep": "KBH billedværk oprettet",
            "maestroFinishStep": "KBH billedværk modtages (SAMLINGS-EJER)",
            "multiform": "",
            "frakture": "",
            "showTitle": true,
            "useMarcField": true,
            "removeTempLocation": "",
            "params": [
                {
                    "key": "field[project_id]",
                    "value": "32"
                },
                {
                    "key": "field[customer_id]",
                    "value": "18"
                },
                {
                    "key": "field[job_id]",
                    "value": "51"
                },
                {
                    "key": "field[step_id]",
                    "value": "69"
                }
            ]
        },
        {
            "deskName": "Atelierbestilling_Kort_10006",
            "deskCode": "Digiproj_10006",
            "workOrderType": "Digiproj",
            "maestroStartStep": "KBH billedværk oprettet",
            "maestroFinishStep": "KBH billedværk modtages (SAMLINGS-EJER)",
            "multiform": "",
            "frakture": "",
            "showTitle": true,
            "useMarcField": true,
            "removeTempLocation": false,
            "params": [
                {
                    "key": "field[project_id]",
                    "value": "32"
                },
                {
                    "key": "field[customer_id]",
                    "value": "18"
                },
                {
                    "key": "field[job_id]",
                    "value": "51"
                },
                {
                    "key": "field[step_id]",
                    "value": "69"
                }
            ]
        }
    ],
    "institution": "45KBDK_KGL"
}

export const DOD_ITEM_WITH_REQUEST = {
    "bib_data": {
        "title": "Engelsk Begynderbog : med Billeder og fuldstændig Udtalebetegnelse /",
        "author": "Jespersen, Otto.",
        "mms_id": "99124813044205763",
        "bib_suppress_from_publishing": "false",
        "complete_edition": "5. Oplag.",
        "network_number": [
            "(EXLNZ-45KBDK_NETWORK)996897453505761"
        ],
        "place_of_publication": "Kbh.,",
        "date_of_publication": "1906.",
        "link": "/almaws/v1/bibs/99124813044205763"
    },
    "holding_data": {
        "holding_id": "222248397400005763",
        "holding_suppress_from_publishing": "false",
        "calculated_suppress_from_publishing": "false",
        "permanent_call_number_type": {
            "value": "8",
            "desc": "Other scheme"
        },
        "permanent_call_number": "47,-382 8°",
        "call_number_type": {
            "value": "8",
            "desc": "Other scheme"
        },
        "call_number": "47,-382 8°",
        "accession_number": "",
        "copy_id": "",
        "in_temp_location": true,
        "temp_library": {
            "value": "KBL",
            "desc": "The Black Diamond, Copenhagen"
        },
        "temp_location": {
            "value": " LFDODMUBOX",
            "desc": "Digitalisering eller læsesal"
        },
        "temp_call_number_type": {
            "value": ""
        },
        "temp_call_number": "",
        "temp_call_number_source": "",
        "temp_policy": {
            "value": ""
        },
        "link": "/almaws/v1/bibs/99124813044205763/holdings/222248397400005763"
    },
    "item_data": {
        "pid": "232248397380005763",
        "barcode": "KB756571",
        "policy": {
            "value": ""
        },
        "provenance": {
            "value": ""
        },
        "description": "",
        "library": {
            "value": "KBL",
            "desc": "The Black Diamond, Copenhagen"
        },
        "location": {
            "value": "LFVINGEX",
            "desc": "Generisk Vinge læsesalslån"
        },
        "pages": "",
        "pieces": "",
        "requested": true,
        "creation_date": "2023-05-24Z",
        "modification_date": "2023-05-24Z",
        "base_status": {
            "value": "1",
            "desc": "Item in place"
        },
        "awaiting_reshelving": false,
        "physical_material_type": {
            "value": "BOOK",
            "desc": "Book"
        },
        "po_line": "",
        "is_magnetic": false,
        "year_of_issue": "",
        "enumeration_a": "",
        "enumeration_b": "",
        "enumeration_c": "",
        "enumeration_d": "",
        "enumeration_e": "",
        "enumeration_f": "",
        "enumeration_g": "",
        "enumeration_h": "",
        "chronology_i": "",
        "chronology_j": "",
        "chronology_k": "",
        "chronology_l": "",
        "chronology_m": "",
        "break_indicator": {
            "value": ""
        },
        "pattern_type": {
            "value": ""
        },
        "linking_number": "",
        "type_of_unit": "",
        "receiving_operator": "pma",
        "process_type": {
            "value": ""
        },
        "inventory_number": "",
        "inventory_price": "",
        "alternative_call_number": "",
        "alternative_call_number_type": {
            "value": ""
        },
        "storage_location_id": "",
        "public_note": "",
        "fulfillment_note": "",
        "internal_note_1": "",
        "internal_note_2": "",
        "internal_note_3": "",
        "statistics_note_1": "",
        "statistics_note_2": "",
        "statistics_note_3": "",
        "physical_condition": {},
        "committed_to_retain": {},
        "retention_reason": {
            "value": ""
        },
        "retention_note": ""
    },
    "link": "/almaws/v1/bibs/99124813044205763/holdings/222248397400005763/items/232248397380005763"
}

export const DOD_ITEM_WITH_REQUEST_AFTER_SCANNING = {
    "bib_data": {
        "title": "Engelsk Begynderbog : med Billeder og fuldstændig Udtalebetegnelse /",
        "author": "Jespersen, Otto.",
        "mms_id": "99124813044205763",
        "bib_suppress_from_publishing": "false",
        "complete_edition": "5. Oplag.",
        "network_number": [
            "(EXLNZ-45KBDK_NETWORK)996897453505761"
        ],
        "place_of_publication": "Kbh.,",
        "date_of_publication": "1906.",
        "link": "/almaws/v1/bibs/99124813044205763"
    },
    "holding_data": {
        "holding_id": "222248397400005763",
        "holding_suppress_from_publishing": "false",
        "calculated_suppress_from_publishing": "false",
        "permanent_call_number_type": {
            "value": "8",
            "desc": "Other scheme"
        },
        "permanent_call_number": "47,-382 8°",
        "call_number_type": {
            "value": "8",
            "desc": "Other scheme"
        },
        "call_number": "47,-382 8°",
        "accession_number": "",
        "copy_id": "",
        "in_temp_location": true,
        "temp_library": {
            "value": "KBL",
            "desc": "The Black Diamond, Copenhagen"
        },
        "temp_location": {
            "value": "LFDOD",
            "desc": "Digitalisering eller læsesal"
        },
        "temp_call_number_type": {
            "value": ""
        },
        "temp_call_number": "",
        "temp_call_number_source": "",
        "temp_policy": {
            "value": ""
        },
        "link": "/almaws/v1/bibs/99124813044205763/holdings/222248397400005763"
    },
    "item_data": {
        "pid": "232248397380005763",
        "barcode": "KB756571",
        "policy": {
            "value": ""
        },
        "provenance": {
            "value": ""
        },
        "description": "",
        "library": {
            "value": "KBL",
            "desc": "The Black Diamond, Copenhagen"
        },
        "location": {
            "value": "LFVINGEX",
            "desc": "Generisk Vinge læsesalslån"
        },
        "pages": "",
        "pieces": "",
        "requested": true,
        "creation_date": "2023-05-24Z",
        "modification_date": "2023-05-24Z",
        "base_status": {
            "value": "0",
            "desc": "Item not in place"
        },
        "awaiting_reshelving": false,
        "physical_material_type": {
            "value": "BOOK",
            "desc": "Book"
        },
        "po_line": "",
        "is_magnetic": false,
        "year_of_issue": "",
        "enumeration_a": "",
        "enumeration_b": "",
        "enumeration_c": "",
        "enumeration_d": "",
        "enumeration_e": "",
        "enumeration_f": "",
        "enumeration_g": "",
        "enumeration_h": "",
        "chronology_i": "",
        "chronology_j": "",
        "chronology_k": "",
        "chronology_l": "",
        "chronology_m": "",
        "break_indicator": {
            "value": ""
        },
        "pattern_type": {
            "value": ""
        },
        "linking_number": "",
        "type_of_unit": "",
        "receiving_operator": "pma",
        "process_type": {
            "value": "WORK_ORDER_DEPARTMENT",
            "desc": "In Process"
        },
        "work_order_type": {
            "value": "PHYSICAL_TO_DIGITIZATION",
            "desc": "Patron digitization request"
        },
        "work_order_at": {
            "value": "DIGINAT",
            "desc": "Nationalbibliotekets digitalisering"
        },
        "inventory_number": "",
        "inventory_price": "",
        "alternative_call_number": "",
        "alternative_call_number_type": {
            "value": ""
        },
        "storage_location_id": "",
        "public_note": "",
        "fulfillment_note": "",
        "internal_note_1": "",
        "internal_note_2": "",
        "internal_note_3": "",
        "statistics_note_1": "",
        "statistics_note_2": "",
        "statistics_note_3": "",
        "physical_condition": {},
        "committed_to_retain": {},
        "retention_reason": {
            "value": ""
        },
        "retention_note": ""
    },
    "link": "/almaws/v1/bibs/99124813044205763/holdings/222248397400005763/items/232248397380005763"
}

export const REQUEST_RESPONSE_DOD_WITH_REQUEST_AND_COMMENT = {
    "user_request": [
        {
            "title": "Engelsk Begynderbog : med Billeder og fuldstændig Udtalebetegnelse / Otto Jespersen og Chr. Sarauw.",
            "volume": "",
            "issue": "",
            "part": "",
            "comment": "test DOD",
            "user_primary_id": "user_id",
            "request_id": "48739955550005763",
            "additional_id": "5555",
            "request_type": "DIGITIZATION",
            "request_sub_type": {
                "value": "PHYSICAL_TO_DIGITIZATION",
                "desc": "Patron digitization request"
            },
            "mms_id": "99124813044205763",
            "holding_id": "439545770005763*25343461470005763*47,-382 8°",
            "managed_by_library": "The Black Diamond, Copenhagen",
            "managed_by_circulation_desk": "Forskningslæsesalen, Den Sorte Diamant",
            "managed_by_library_code": "KBL",
            "managed_by_circulation_desk_code": "DEFAULT_CIRC_DESK",
            "target_destination": {
                "value": "DIGINAT",
                "desc": "Nationalbibliotekets digitalisering"
            },
            "material_type": {},
            "partial_digitization": false,
            "date_of_publication": "",
            "request_status": "IN_PROCESS",
            "request_date": "2023-11-06Z",
            "request_time": "2023-11-06T10:07:48.076Z",
            "task_name": "Pickup From Shelf",
            "expiry_date": "2023-11-15Z",
            "copyrights_declaration_signed_by_patron": false
        }
    ],
    "total_record_count": 1
}

export const DOD_ITEM_WITHOUT_REQUEST = {
    "bib_data": {
        "title": "The England and America Reader /",
        "author": "Jespersen, Otto.",
        "mms_id": "99124846856805763",
        "bib_suppress_from_publishing": "false",
        "complete_edition": "2. Udgave med Noter.",
        "network_number": [
            "(EXLNZ-45KBDK_NETWORK)996908060805761"
        ],
        "place_of_publication": "Kbh.,",
        "date_of_publication": "1908.",
        "link": "/almaws/v1/bibs/99124846856805763"
    },
    "holding_data": {
        "holding_id": "222249024340005763",
        "holding_suppress_from_publishing": "false",
        "calculated_suppress_from_publishing": "false",
        "permanent_call_number_type": {
            "value": "8",
            "desc": "Other scheme"
        },
        "permanent_call_number": "47,-384 8°",
        "call_number_type": {
            "value": "8",
            "desc": "Other scheme"
        },
        "call_number": "47,-384 8°",
        "accession_number": "",
        "copy_id": "",
        "in_temp_location": true,
        "temp_library": {
            "value": "KBL",
            "desc": "The Black Diamond, Copenhagen"
        },
        "temp_location": {
            "value": "LFDOD",
            "desc": "Digitalisering eller læsesal"
        },
        "temp_call_number_type": {
            "value": ""
        },
        "temp_call_number": "",
        "temp_call_number_source": "",
        "temp_policy": {
            "value": ""
        },
        "link": "/almaws/v1/bibs/99124846856805763/holdings/222249024340005763"
    },
    "item_data": {
        "pid": "232249024320005763",
        "barcode": "KB759030",
        "policy": {
            "value": ""
        },
        "provenance": {
            "value": ""
        },
        "description": "",
        "library": {
            "value": "KBL",
            "desc": "The Black Diamond, Copenhagen"
        },
        "location": {
            "value": "LFVINGEX",
            "desc": "Generisk Vinge læsesalslån"
        },
        "pages": "",
        "pieces": "",
        "requested": false,
        "creation_date": "2023-05-31Z",
        "modification_date": "2023-05-31Z",
        "base_status": {
            "value": "1",
            "desc": "Item in place"
        },
        "awaiting_reshelving": false,
        "physical_material_type": {
            "value": "BOOK",
            "desc": "Book"
        },
        "po_line": "",
        "is_magnetic": false,
        "year_of_issue": "",
        "enumeration_a": "",
        "enumeration_b": "",
        "enumeration_c": "",
        "enumeration_d": "",
        "enumeration_e": "",
        "enumeration_f": "",
        "enumeration_g": "",
        "enumeration_h": "",
        "chronology_i": "",
        "chronology_j": "",
        "chronology_k": "",
        "chronology_l": "",
        "chronology_m": "",
        "break_indicator": {
            "value": ""
        },
        "pattern_type": {
            "value": ""
        },
        "linking_number": "",
        "type_of_unit": "",
        "receiving_operator": "pma",
        "process_type": {
            "value": ""
        },
        "inventory_number": "",
        "inventory_price": "",
        "alternative_call_number": "",
        "alternative_call_number_type": {
            "value": ""
        },
        "storage_location_id": "",
        "public_note": "",
        "fulfillment_note": "",
        "internal_note_1": "",
        "internal_note_2": "",
        "internal_note_3": "",
        "statistics_note_1": "",
        "statistics_note_2": "",
        "statistics_note_3": "",
        "physical_condition": {},
        "committed_to_retain": {},
        "retention_reason": {
            "value": ""
        },
        "retention_note": ""
    },
    "link": "/almaws/v1/bibs/99124846856805763/holdings/222249024340005763/items/232249024320005763"
}

export const REQUEST_RESPONSE_DOD_WITHOUT_REQUEST = {
    "total_record_count": 0
}

export const WORK_ORDER_ITEM_WITH_REQUEST = {
    "bib_data": {
        "title": "The homeland /",
        "author": "Naʻnʻa, Ḥamı̄dah.",
        "isbn": "1859640214",
        "mms_id": "99122132364105763",
        "bib_suppress_from_publishing": "false",
        "complete_edition": "First English edition.",
        "network_number": [
            "(DK-870970)24931323",
            "(DK-820010)003059136SOL01",
            "(EXLNZ-45KBDK_NETWORK)994799424105761"
        ],
        "place_of_publication": "Reading :",
        "date_of_publication": "1995.",
        "publisher_const": "Garnet Publishing Ltd",
        "link": "/almaws/v1/bibs/99122132364105763"
    },
    "holding_data": {
        "holding_id": "221701562620005763",
        "holding_suppress_from_publishing": "false",
        "calculated_suppress_from_publishing": "false",
        "permanent_call_number_type": {
            "value": "8",
            "desc": "Other scheme"
        },
        "permanent_call_number": "51-466945",
        "call_number_type": {
            "value": "8",
            "desc": "Other scheme"
        },
        "call_number": "51-466945",
        "accession_number": "",
        "copy_id": "",
        "in_temp_location": true,
        "temp_library": {},
        "temp_location": {
            "value": "LFDODX",
            "desc": "Digitalisering eller læsesal"
        },
        "temp_call_number_type": {
            "value": ""
        },
        "temp_call_number": "",
        "temp_call_number_source": "",
        "temp_policy": {
            "value": ""
        },
        "link": "/almaws/v1/bibs/99122132364105763/holdings/221701562620005763"
    },
    "item_data": {
        "pid": "231701562580005763",
        "barcode": "400021689597",
        "policy": {
            "value": ""
        },
        "provenance": {
            "value": ""
        },
        "description": "",
        "library": {
            "value": "SBMAG",
            "desc": "KB Victor Albecks Vej, Aarhus"
        },
        "location": {
            "value": "HFSBCIVSK2",
            "desc": "Skejby 2, hjemlån, Flersproglig samling, Voksne"
        },
        "pages": "",
        "pieces": "",
        "requested": true,
        "creation_date": "2006-12-05Z",
        "modification_date": "2009-01-21Z",
        "base_status": {
            "value": "1",
            "desc": "Item in place"
        },
        "awaiting_reshelving": false,
        "physical_material_type": {
            "value": "BOOK",
            "desc": "Book"
        },
        "po_line": "",
        "is_magnetic": false,
        "arrival_date": "2006-12-05Z",
        "year_of_issue": "",
        "enumeration_a": "",
        "enumeration_b": "",
        "enumeration_c": "",
        "enumeration_d": "",
        "enumeration_e": "",
        "enumeration_f": "",
        "enumeration_g": "",
        "enumeration_h": "",
        "chronology_i": "",
        "chronology_j": "",
        "chronology_k": "",
        "chronology_l": "",
        "chronology_m": "",
        "break_indicator": {
            "value": ""
        },
        "pattern_type": {
            "value": ""
        },
        "linking_number": "",
        "type_of_unit": "",
        "receiving_operator": "import",
        "process_type": {
            "value": ""
        },
        "inventory_number": "",
        "inventory_price": "",
        "alternative_call_number": "Øvrige sprog",
        "alternative_call_number_type": {
            "value": "8",
            "desc": "Other scheme"
        },
        "storage_location_id": "",
        "public_note": "",
        "fulfillment_note": "",
        "internal_note_1": "",
        "internal_note_2": "",
        "internal_note_3": "",
        "statistics_note_1": "",
        "statistics_note_2": "",
        "statistics_note_3": "",
        "physical_condition": {},
        "committed_to_retain": {},
        "retention_reason": {
            "value": ""
        },
        "retention_note": ""
    },
    "link": "/almaws/v1/bibs/99122132364105763/holdings/221701562620005763/items/231701562580005763"
}

export const REQUEST_RESPONSE_WORK_ORDER_WITH_REQUEST_AND_COMMENT = {
    "user_request": [
        {
            "title": "The homeland / by Hamida Na'na' ; translated by Martin Asser.",
            "author": "Naʻnʻa, Ḥamı̄dah.",
            "volume": "",
            "issue": "",
            "part": "",
            "comment": "Test af work order request",
            "barcode": "400021689597",
            "request_id": "48739975010005763",
            "additional_id": "7501",
            "request_type": "WORK_ORDER",
            "request_sub_type": {
                "value": "Digiproj",
                "desc": "Projektdigitalisering"
            },
            "mms_id": "99122132364105763",
            "managed_by_library": "KB Victor Albecks Vej, Aarhus",
            "managed_by_circulation_desk": "Skejby Circ.Desk",
            "managed_by_library_code": "SBMAG",
            "managed_by_circulation_desk_code": "SKEJBY_DESK",
            "target_destination": {
                "value": "Digiproj_10068",
                "desc": "Lindhardt og Ringhof uden Alma publicering_10068"
            },
            "material_type": {
                "value": "BOOK",
                "desc": "Book"
            },
            "date_of_publication": "",
            "request_status": "IN_PROCESS",
            "request_date": "2023-11-06Z",
            "request_time": "2023-11-06T13:02:12.501Z",
            "task_name": "Pickup From Shelf",
            "expiry_date": "2051-03-23Z",
            "item_id": "231701562580005763"
        }
    ],
    "total_record_count": 1
}

export const WORK_ORDER_ITEM_WITHOUT_REQUEST = {
    "bib_data": {
        "title": "Homeland /",
        "author": "Salvatore, R. A.,",
        "isbn": "1631401971",
        "mms_id": "99122306912805763",
        "bib_suppress_from_publishing": "false",
        "complete_edition": "",
        "network_number": [
            "(OCoLC)898155472",
            "(DK-820010)006167443SOL01",
            "(EXLNZ-45KBDK_NETWORK)995360658205761"
        ],
        "place_of_publication": "San Diego :",
        "date_of_publication": "2015.",
        "publisher_const": "IDW",
        "link": "/almaws/v1/bibs/99122306912805763"
    },
    "holding_data": {
        "holding_id": "221762150630005763",
        "holding_suppress_from_publishing": "false",
        "calculated_suppress_from_publishing": "false",
        "permanent_call_number_type": {
            "value": "8",
            "desc": "Other scheme"
        },
        "permanent_call_number": "2-138-8803",
        "call_number_type": {
            "value": "8",
            "desc": "Other scheme"
        },
        "call_number": "2-138-8803",
        "accession_number": "",
        "copy_id": "",
        "in_temp_location": false,
        "temp_library": {
            "value": "SBMAG",
            "desc": "KB Victor Albecks Vej, Aarhus"
        },
        "temp_location": {
            "value": "FJE",
            "desc": "Fjernlån - Det Kgl. Aarhus"
        },
        "temp_call_number_type": {
            "value": ""
        },
        "temp_call_number": "",
        "temp_call_number_source": "",
        "temp_policy": {
            "value": ""
        },
        "link": "/almaws/v1/bibs/99122306912805763/holdings/221762150630005763"
    },
    "item_data": {
        "pid": "231762150600005763",
        "barcode": "400027915009",
        "policy": {
            "value": "Hjemlån",
            "desc": "- Hjemlån"
        },
        "provenance": {
            "value": ""
        },
        "description": "",
        "library": {
            "value": "SBMAG",
            "desc": "KB Victor Albecks Vej, Aarhus"
        },
        "location": {
            "value": "HFSMAG16",
            "desc": "16. etage, hjemlån"
        },
        "pages": "",
        "pieces": "",
        "requested": false,
        "creation_date": "2015-08-07Z",
        "modification_date": "2023-06-17Z",
        "base_status": {
            "value": "1",
            "desc": "Item in place"
        },
        "awaiting_reshelving": false,
        "physical_material_type": {
            "value": "BOOK",
            "desc": "Book"
        },
        "po_line": "",
        "is_magnetic": false,
        "arrival_date": "2015-08-07Z",
        "year_of_issue": "",
        "enumeration_a": "",
        "enumeration_b": "",
        "enumeration_c": "",
        "enumeration_d": "",
        "enumeration_e": "",
        "enumeration_f": "",
        "enumeration_g": "",
        "enumeration_h": "",
        "chronology_i": "",
        "chronology_j": "",
        "chronology_k": "",
        "chronology_l": "",
        "chronology_m": "",
        "break_indicator": {
            "value": ""
        },
        "pattern_type": {
            "value": ""
        },
        "linking_number": "",
        "type_of_unit": "",
        "receiving_operator": "import",
        "process_type": {
            "value": ""
        },
        "inventory_number": "",
        "inventory_price": "",
        "alternative_call_number": "",
        "alternative_call_number_type": {
            "value": ""
        },
        "storage_location_id": "",
        "public_note": "",
        "fulfillment_note": "",
        "internal_note_1": "",
        "internal_note_2": "",
        "internal_note_3": "",
        "statistics_note_1": "",
        "statistics_note_2": "",
        "statistics_note_3": "Maintenance count: 007",
        "physical_condition": {},
        "committed_to_retain": {},
        "retention_reason": {
            "value": ""
        },
        "retention_note": ""
    },
    "link": "/almaws/v1/bibs/99122306912805763/holdings/221762150630005763/items/231762150600005763"
}

export const REQUEST_RESPONSE_WORK_ORDER_WITHOUT_REQUEST = {
    "total_record_count": 0
}

export const MAESTRO_CREATED_DOD_BEFORE_NEXT_STEP = {
    "id": "33249",
    "barcode": "KB756571",
    "reference": "KB756571",
    "title": "",
    "customer_id": "2",
    "customer_title": "KBH-PLG",
    "project_id": "3",
    "project_title": "10001-DOD",
    "job_id": "32",
    "job_title": "10001-KBH-OCR-ALTO-PDF-ALMA",
    "step_id": "25",
    "step_title": "KBH bog oprettet",
    "scanner_id": "0",
    "working": "1",
    "working_user_id": "4",
    "working_user_name": "anthony",
    "image_count": "0",
    "foldout_count": "0",
    "foldout_status": "none",
    "alert_info": "",
    "created_on": "2023-11-14 13:23:51",
    "modified_on": "2023-11-14 13:24:13",
    "custom_field": {
        "61": {"title": "Multivolume", "value": ""},
        "62": {"title": "Fraktur", "value": ""},
        "64": {"title": "Kommentarer", "value": ""},
        "65": {"title": "Lokation", "value": ""},
        "66": {"title": "Initialer", "value": ""},
        "74": {"title": "parts_of_physical_item", "value": ""}
    }
}

export const MAESTRO_CREATED_WORK_ORDER_BEFORE_NEXT_STEP = {
    "id": "33249",
    "barcode": "400021689597",
    "reference": "400021689597",
    "title": "",
    "customer_id": "7",
    "customer_title": "KBH-PLG",
    "project_id": "9",
    "project_title": "10001-DOD",
    "job_id": "49",
    "job_title": "10001-KBH-OCR-ALTO-PDF-ALMA",
    "step_id": "25",
    "step_title": "KBH bog oprettet",
    "scanner_id": "0",
    "working": "1",
    "working_user_id": "4",
    "working_user_name": "anthony",
    "image_count": "0",
    "foldout_count": "0",
    "foldout_status": "none",
    "alert_info": "",
    "created_on": "2023-11-14 13:23:51",
    "modified_on": "2023-11-14 13:24:13",
    "custom_field": {
        "61": {"title": "Multivolume", "value": ""},
        "62": {"title": "Fraktur", "value": ""},
        "64": {"title": "Kommentarer", "value": ""},
        "65": {"title": "Lokation", "value": ""},
        "66": {"title": "Initialer", "value": ""},
        "74": {"title": "parts_of_physical_item", "value": ""}
    }
}

export const MAESTRO_CREATED_RECORD_AFTER_NEXT_STEP = {
    "id": "33249",
    "barcode": "KB756571",
    "reference": "KB756571",
    "title": "",
    "customer_id": "2",
    "customer_title": "KBH-PLG",
    "project_id": "3",
    "project_title": "10001-DOD",
    "job_id": "32",
    "job_title": "10001-KBH-OCR-ALTO-PDF-ALMA",
    "step_id": "57",
    "step_title": "KBH bog modtages (DIGI)",
    "scanner_id": "0",
    "working": "1",
    "working_user_id": "11",
    "working_user_name": "tlr",
    "image_count": "0",
    "foldout_count": "0",
    "foldout_status": "none",
    "alert_info": "",
    "created_on": "2023-11-14 13:23:51",
    "modified_on": "2023-11-14 13:41:18",
    "custom_field": {
        "61": {"title": "Multivolume", "value": ""},
        "62": {"title": "Fraktur", "value": ""},
        "64": {"title": "Kommentarer", "value": ""},
        "65": {"title": "Lokation", "value": ""},
        "66": {"title": "Initialer", "value": ""},
        "74": {"title": "parts_of_physical_item", "value": ""}
    }
}
