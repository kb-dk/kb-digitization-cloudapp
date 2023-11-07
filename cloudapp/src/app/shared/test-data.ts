export const HOLDING = {
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
        "<?xml version=\"1.0\" encoding=\"UTF-16\"?><record><leader>00213nx  a22000731i 4500</leader><controlfield tag=\"008\">1910192u    8   4001uueng0000000</controlfield><controlfield tag=\"005\">20230921105412.0</controlfield><datafield ind1=\" \" ind2=\" \" tag=\"583\"><subfield code=\"x\">filnavnssyntax</subfield></datafield><datafield ind1=\"8\" ind2=\" \" tag=\"852\"><subfield code=\"b\">KBL</subfield><subfield code=\"c\">LFKOBKBS</subfield><subfield code=\"h\">KBK 1111,251,3-22a-1979-1983 1984-24/17</subfield></datafield></record>"
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
        "firstName": "my_name",
        "lastName": "my_last_name",
        "primaryId": "my_id",
        "currentlyAtLibCode": "45KBDK_KGL",
        "currentlyAtDept": "Digiproj_1008",
        "isAdmin": true
    },
    "lang": "en",
    "instCode": "45KBDK_KGL",
    "urls": {
        "alma": "http://localhost:4200/",
        "primo": "https://kbdk-kgl-psb.primo.exlibrisgroup.com"
    },
    "color": "green"
}

export const EMPTY_CONFIG = {}

export const CONFIG = {
    "serviceUrl": "https://mae-api-test-01.kb.dk/api/",
    "apiKey": "ff74e7fb2254dd3ce3703ae049432615cb7a8c9cf3d947c5b99d846e6ee5073149932f2eec7f1585a8dd72f712a2864b0037f17dbf59dd86dc7773e687602692",
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

