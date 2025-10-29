package com.boilerplate.billing.exception;

public class BusinessException extends RuntimeException {
  private final BillingException billingException;

  public BusinessException(BillingException billingException) {
    super(billingException.getMessage());
    this.billingException = billingException;
  }

  public BillingException getBillingException() {
    return billingException;
  }
}
