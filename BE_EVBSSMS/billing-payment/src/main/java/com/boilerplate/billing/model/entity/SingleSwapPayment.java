package com.boilerplate.billing.model.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "single_swap_payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SingleSwapPayment extends BasePayment {

    // ID trạm đổi pin nơi diễn ra giao dịch
    @ManyToOne
    private Station station;

}
