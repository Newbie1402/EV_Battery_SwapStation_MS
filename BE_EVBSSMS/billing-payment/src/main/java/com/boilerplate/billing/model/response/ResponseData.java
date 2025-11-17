package com.boilerplate.billing.model.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonPropertyOrder({ "statusCode", "message", "data" })
public class ResponseData<T> implements Serializable {
    private int statusCode;
    private String message;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private T data;
}

