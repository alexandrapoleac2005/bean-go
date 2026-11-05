package com.cafe.bean_go.services;

import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopDetailsResponseDTO;
import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopRequestDTO;
import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopSummaryResponseDTO;
import com.cafe.bean_go.dtos.menu.MenuItemRequestDTO;
import com.cafe.bean_go.dtos.schedule.OperatingHoursRequestDTO;
import com.cafe.bean_go.dtos.schedule.OperatingHoursResponseDTO;
import com.cafe.bean_go.entities.CoffeeShop;
import com.cafe.bean_go.entities.MenuItem;
import com.cafe.bean_go.entities.OperatingHours;
import com.cafe.bean_go.entities.User;
import com.cafe.bean_go.exceptions.CoffeeShopOwnershipException;
import com.cafe.bean_go.exceptions.InvalidScheduleException;
import com.cafe.bean_go.exceptions.ResourceNotFoundException;
import com.cafe.bean_go.mappers.CoffeeShopMapper;
import com.cafe.bean_go.repositories.CoffeeShopRepository;
import com.cafe.bean_go.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CoffeeShopService {
    private final CoffeeShopRepository coffeeShopRepository;
    private final CoffeeShopMapper coffeeShopMapper;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<CoffeeShopSummaryResponseDTO> getAllCoffeeShopsSummary(int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("id"));

        Page<CoffeeShop> coffeeShopPage = coffeeShopRepository.findByIsApprovedTrue(pageable);

        return coffeeShopPage.map(coffeeShopMapper::toSummaryDto);
    }

    @Transactional(readOnly = true)
    public CoffeeShopDetailsResponseDTO getCoffeeShopById(Long id) {
        CoffeeShop coffeeShop = coffeeShopRepository.findById(id)
                .filter(shop -> Boolean.TRUE.equals(shop.getIsApproved()))
                .orElseThrow(() -> new ResourceNotFoundException("Coffee shop with ID " + id + " not found!"));

        return coffeeShopMapper.toDetailsDto(coffeeShop);
    }

    @Transactional
    public CoffeeShopDetailsResponseDTO addMenuItemToCoffeeShop(Long coffeeShopId, Long loggedInUserId, MenuItemRequestDTO itemDto) {
        CoffeeShop shop = coffeeShopRepository.findById(coffeeShopId).orElseThrow(() -> new ResourceNotFoundException("Coffee shop with ID " + coffeeShopId + " not found!"));

        if (!shop.getMerchant().getId().equals(loggedInUserId)) {
            throw new CoffeeShopOwnershipException("You do not have permission to modify the menu of this coffee shop!");
        }
        MenuItem newItem = coffeeShopMapper.toMenuItemEntity(itemDto);
        newItem.setCoffeeShop(shop);
        shop.getMenuItems().add(newItem);

        coffeeShopRepository.saveAndFlush(shop);

        return coffeeShopMapper.toDetailsDto(shop);

    }

    @Transactional
    public CoffeeShopDetailsResponseDTO updateMenuItem(Long coffeeShopId, Long loggedInUserId, Long itemId, MenuItemRequestDTO itemDto) {

        CoffeeShop shop = coffeeShopRepository.findById(coffeeShopId)
                .orElseThrow(() -> new ResourceNotFoundException("Coffee shop with ID " + coffeeShopId + " not found!"));

        if (!shop.getMerchant().getId().equals(loggedInUserId)) {
            throw new CoffeeShopOwnershipException("You do not have permission to modify the menu of this coffee shop!");
        }

        MenuItem itemToUpdate = shop.getMenuItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Menu item with ID " + itemId + " not found in this coffee shop!"));

        itemToUpdate.setName(itemDto.getName());
        itemToUpdate.setCategory(itemDto.getCategory());
        itemToUpdate.setPrice(itemDto.getPrice());
        itemToUpdate.setDescription(itemDto.getDescription());

        return coffeeShopMapper.toDetailsDto(shop);
    }

    @Transactional
    public void deleteMenuItem(Long coffeeShopId, Long loggedInUserId, Long itemId) {

        CoffeeShop shop = coffeeShopRepository.findById(coffeeShopId)
                .orElseThrow(() -> new ResourceNotFoundException("Coffee shop with ID " + coffeeShopId + " not found!"));

        if (!shop.getMerchant().getId().equals(loggedInUserId)) {
            throw new CoffeeShopOwnershipException("You do not have permission to modify the menu of this coffee shop!");
        }

        MenuItem itemToRemove = shop.getMenuItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Menu item with ID " + itemId + " not found in this coffee shop!"));

        shop.getMenuItems().remove(itemToRemove);
    }

    @Transactional(readOnly = true)
    public List<CoffeeShopSummaryResponseDTO> getNearbyCoffeeShops(double lat, double lng, double radiusInMeters) {

        List<Long> ids = coffeeShopRepository.findNearbyCoffeeShopIds(lat, lng, radiusInMeters);
        Map<Long, CoffeeShop> byId = coffeeShopRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(CoffeeShop::getId, s -> s));

        return ids.stream()
                .map(byId::get)
                .map(coffeeShopMapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void approveCoffeeShop(Long coffeeShopId) {
        CoffeeShop shop = coffeeShopRepository.findById(coffeeShopId)
                .orElseThrow(() -> new ResourceNotFoundException("Coffee shop with ID " + coffeeShopId + " not found!"));

        if (Boolean.TRUE.equals(shop.getIsApproved())) {
            return ;
        }

        shop.setIsApproved(true);
    }

    @Transactional
    public CoffeeShopDetailsResponseDTO createCoffeeShop(Long merchantId, CoffeeShopRequestDTO requestDTO) {

        User merchant = userRepository.findById(merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Merchant not found!"));

        CoffeeShop newShop = coffeeShopMapper.toEntity(requestDTO);
        newShop.setMerchant(merchant);

        CoffeeShop savedShop = coffeeShopRepository.save(newShop);
        return coffeeShopMapper.toDetailsDto(savedShop);
    }

    @Transactional
    public List<OperatingHoursResponseDTO> updateOperatingHours(Long coffeeShopId, Long merchantId, List<OperatingHoursRequestDTO> scheduleRequests) {

        CoffeeShop shop = coffeeShopRepository.findById(coffeeShopId)
                .orElseThrow(() -> new ResourceNotFoundException("Coffee shop not found with id: " + coffeeShopId));

        if (!shop.getMerchant().getId().equals(merchantId)) {
            throw new CoffeeShopOwnershipException("You do not have permission to modify the schedule for this coffee shop!");
        }

        validateSchedule(scheduleRequests);

        shop.getOperatingHours().clear();

        List<OperatingHours> newSchedule = scheduleRequests.stream()
                .map(dto -> {
                    OperatingHours hours = coffeeShopMapper.toOperatingHoursEntity(dto);
                    hours.setCoffeeShop(shop);
                    return hours;
                })
                .toList();

        shop.getOperatingHours().addAll(newSchedule);

        return shop.getOperatingHours().stream()
                .map(coffeeShopMapper::toOperatingHoursDto)
                .toList();

    }

    // Each day may appear only once, and the shop must close after it opens.
    private void validateSchedule(List<OperatingHoursRequestDTO> scheduleRequests) {
        Set<DayOfWeek> seenDays = EnumSet.noneOf(DayOfWeek.class);

        for (OperatingHoursRequestDTO dto : scheduleRequests) {
            if (!seenDays.add(dto.getDayOfWeek())) {
                throw new InvalidScheduleException("Duplicate schedule entry for " + dto.getDayOfWeek());
            }
            if (!dto.getCloseTime().isAfter(dto.getOpenTime())) {
                throw new InvalidScheduleException("Close time must be after open time for " + dto.getDayOfWeek());
            }
        }
    }
}
