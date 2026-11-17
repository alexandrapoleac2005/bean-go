package com.cafe.bean_go.dtos.voucher;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherRedeemRequestDTO {

    @NotBlank(message = "The voucher code is mandatory")
    @Size(max = 16, message = "The voucher code is too long")
    private String code;
}
