package com.cafe.bean_go.services;

import com.cafe.bean_go.dtos.loyalty.LoyaltyPointResponseDTO;
import com.cafe.bean_go.entities.CoffeeShop;
import com.cafe.bean_go.entities.LoyaltyPoint;
import com.cafe.bean_go.entities.User;
import com.cafe.bean_go.entities.Voucher;
import com.cafe.bean_go.entities.enums.VoucherStatus;
import com.cafe.bean_go.exceptions.ResourceNotFoundException;
import com.cafe.bean_go.mappers.LoyaltyPointMapper;
import com.cafe.bean_go.repositories.CoffeeShopRepository;
import com.cafe.bean_go.repositories.LoyaltyPointRepository;
import com.cafe.bean_go.repositories.UserRepository;
import com.cafe.bean_go.repositories.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoyaltyPointService {

    private final LoyaltyPointRepository loyaltyPointRepository;
    private final LoyaltyPointMapper loyaltyPointMapper;
    private final UserService userService;
    private final VoucherRepository voucherRepository;
    private final UserRepository userRepository;
    private final CoffeeShopRepository coffeeShopRepository;

    @Value("${beango.loyalty.points-for-voucher}")
    private int pointsForVoucher;
    @Value("${beango.loyalty.max-active-vouchers}")
    private int maxActiveVouchers;

    @Transactional(readOnly = true)
    public List<LoyaltyPointResponseDTO> getUserWallets(Long userId){
        return loyaltyPointRepository.findAllByUserId(userId)
                .stream()
                .map(loyaltyPointMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addPointsAfterPurchase(Long userId, Long coffeeShopId, int pointsToAdd) {
        userService.addLifetimePoints(userId, pointsToAdd);
        LoyaltyPoint wallet = loyaltyPointRepository.findByUserIdAndCoffeeShopId(userId, coffeeShopId)
                .orElseGet(() -> createNewWallet(userId, coffeeShopId));

        wallet.setPoints(wallet.getPoints() + pointsToAdd);
        long activeVouchersCount = voucherRepository.countByUserIdAndCoffeeShopIdAndStatus(
                userId, coffeeShopId, VoucherStatus.ACTIVE);

        while (wallet.getPoints() >= pointsForVoucher && activeVouchersCount < maxActiveVouchers) {
            generateVoucher(wallet.getUser(), wallet.getCoffeeShop());
            wallet.setPoints(wallet.getPoints() - pointsForVoucher);
            activeVouchersCount++;
        }

        loyaltyPointRepository.save(wallet);
    }

    private LoyaltyPoint createNewWallet(Long userId, Long coffeeShopId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        CoffeeShop coffeeShop = coffeeShopRepository.findById(coffeeShopId)
                .orElseThrow(() -> new ResourceNotFoundException("Coffee shop not found"));

        return LoyaltyPoint.builder()
                .user(user)
                .coffeeShop(coffeeShop)
                .points(0)
                .build();
    }

    private void generateVoucher(User user, CoffeeShop coffeeShop) {
        Voucher newVoucher = Voucher.builder()
                .user(user)
                .coffeeShop(coffeeShop)
                .status(VoucherStatus.ACTIVE)
                .discountPercentage(10)
                .expiresAt(LocalDateTime.now().plusMonths(3))
                .build();

        voucherRepository.save(newVoucher);
    }
}
