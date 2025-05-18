from typing import Dict, Optional, Any, Union
from pydantic import BaseModel, RootModel


class Address(BaseModel):
    apt: Optional[str] = None
    street: str
    city: str
    state: str
    zip: str


class ContactUs(BaseModel):
    website: str
    email: str


class NewCharges(BaseModel):
    period: str
    internet: str
    telephone: str
    taxesFeesAndSurcharges: str
    totalNewCharges: str


class InnerTelephone(BaseModel):
    directoryListingNonPublished: str
    voiceManagerMeasuredLine: str
    voiceManagerEssentialPackage: str


class Internet(BaseModel):
    cbiModem: str
    staticIPAddress: str
    cbi300MbpsX30Mbps: str
    totalInternet: str


class Telephone(RootModel[Dict[str, Union[InnerTelephone, str]]]):
    root: Dict[str, Union[InnerTelephone, str]]


class MonthlyServices(BaseModel):
    internet: Internet
    telephone: Telephone
    totalMonthlyServices: str


class InternetTaxesAndFees(BaseModel):
    countySalesTax: str
    citySalesTax: str
    stateSalesTax: str
    totalInternetTaxesAndFees: str


class Taxes(BaseModel):
    e911Tax: str
    _988Tax: str
    federalExciseTax: str
    totalTaxes: str


class FeesAndSurcharges(BaseModel):
    networkInterfaceFeeMultiLine: str


class TaxesFeesAndSurchargesCont(BaseModel):
    accessRecoveryFeeMultiLine: str
    californiaHighCostFundB: str
    stateUniversalServiceFund: str
    stateRegulatoryFee: str
    federalUniversalServiceFund: str
    totalFeesAndSurcharges: str
    totalTelephoneTaxesFeesAndSurcharges: str


class TelephoneTaxesFeesAndSurcharges(BaseModel):
    taxes: Taxes
    feesAndSurcharges: FeesAndSurcharges
    taxesFeesAndSurchargesCont_: TaxesFeesAndSurchargesCont


class TaxesFeesAndSurcharges(BaseModel):
    internetTaxesAndFees: InternetTaxesAndFees
    telephoneTaxesFeesAndSurcharges: TelephoneTaxesFeesAndSurcharges
    totalTaxesFeesAndSurcharges: str


class PaymentOptions(BaseModel):
    online: str
    mail: str
    inPerson: str


class CustomerInformation(BaseModel):
    _911Services: str


class DynamicModel(BaseModel):
    documentType: str
    billDate: str
    accountName: str
    accountNumber: str
    dueDate: str
    totalDue: str
    previousBalance: str
    paymentReceived: str
    remainingPreviousBalance: str
    newCharges: NewCharges
    serviceAddress: Address
    contactUs: ContactUs
    monthlyServices: MonthlyServices
    taxesFeesAndSurcharges: TaxesFeesAndSurcharges
    paymentOptions: PaymentOptions
    customerInformation: CustomerInformation
