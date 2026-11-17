# Digitization addon

An Alma cloud app from the Royal Danish Library for working with its digitization system, Maestro.

Staff at a digitization desk use the app to send items to digitization and receive them back. Each time, the app
updates the item in Alma and moves it to the next step in Maestro. An administrator sets up the desks and the
connection to Maestro in the app's configuration.

## Using the app

When the app opens, it shows the desk you are working at, plus two tabs:

- **Send To Digitization**: scan or type an item's barcode and press Enter. The app scans the item in to the desk in
  Alma (with a work order, if one is configured), and moves it to the desk's *Maestro start step*. Depending on the desk
  settings you can also mark the item as *Fraktur* or *Multi-Volume*, add a note, and check the item's comments before
  it is sent.
- **Receive From Digitization**: scan the item when it comes back. The app marks the item as done in Alma, moves it to
  the desk's *Maestro finish step*, and can remove its temporary (DOD) location.

### Barcode or field 583x

If the desk has *Use Marc field 583x, instead of barcode* enabled, you can type in either a barcode or the value of
MARC field 583, subfield x (for example `NKS-4_4737_1`). The app first looks the value up as a barcode. If no item has
that barcode, it searches the 583x field instead.

If the 583x value belongs to a holding with more than one item, a list of all the items on the holding appears, and you
choose the one to send or receive.

## Configuration

Open the configuration page from the app's settings menu in Alma.

**Basics**

| Field | Meaning |
|---|---|
| Url | Address of the Maestro service the app calls. |
| Api key | Key used to call the Maestro service. |
| Parameter 1, 2, … | Names of extra parameters sent to Maestro. Each desk gives them a value. |

**Desks**: one entry per desk.

| Field | Meaning |
|---|---|
| Alma desk/location name / code | The Alma department the items are scanned in to. |
| WorkOrderType | Optional Alma work order type used when scanning in. |
| Maestro start step / finish step | The Maestro steps that items are moved to when sent and received. |
| Show title | Shows a *Note* field on the send tab. |
| Check requests | Only allows sending items that have a request in Alma. |
| Fraktur allowed / Multi-Volume allowed | Shows the *Fraktur* / *Multi-Volume* checkboxes on the send tab. |
| Use Marc field 583x, instead of barcode | Allows looking up items by field 583x (see above). |
| Remove temporary location when book is received (DOD) | Removes the item's temporary location when it is received. |
| Parameters | This desk's values for the parameters defined under *Basics*. |

**Update with json**: paste a complete configuration as JSON to replace the current one.

## Development

See [DEVELOPER.md](DEVELOPER.md) for how to run the app locally and run the tests.
