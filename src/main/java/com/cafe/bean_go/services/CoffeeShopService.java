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
import com.cafe.bean_go.exceptions.CoffeeShopOwnershipException;
import com.cafe.bean_go.exceptions.ResourceNotFoundException;
import com.cafe.bean_go.mappers.CoffeeShopMapper;
import com.cafe.bean_go.repositories.CoffeeShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CoffeeShopService {
    private final CoffeeShopRepository coffeeShopRepository;
    private final CoffeeShopMapper coffeeShopMapper;

    @Transactional(readOnly = true)
    public Page<CoffeeShopSummaryResponseDTO> getAllCoffeeShopsSummary(int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<CoffeeShop> coffeeShopPage = coffeeShopRepository.findByIsApprovedTrue(pageable);

        return coffeeShopPage.map(coffeeShopMapper::toSummaryDto);
    }

    @Transactional(readOnly = true)
    public CoffeeShopDetailsResponseDTO getCoffeeShopById(Long id) {
        CoffeeShop coffeeShop = coffeeShopRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Coffee shop with ID " + id + " not found!"));

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

        List<CoffeeShop> nearbyShops = coffeeShopRepository.findNearbyCoffeeShops(lat, lng, radiusInMeters);

        return nearbyShops.stream()
                .map(coffeeShopMapper::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void approveCoffeeShop(Long coffeeShopId) {
        CoffeeShop shop = coffeeShopRepository.findById(coffeeShopId)
                .orElseThrow(() -> new ResourceNotFoundException("Coffee shop with ID " + coffeeShopId + " not found!"));

        if (Boolean.TRUE.equals(shop.getIsApproved())) {
            throw new IllegalStateException("Coffee shop is already approved!");
        }

        shop.setIsApproved(true);
    }

    @Transactional
    public CoffeeShopDetailsResponseDTO createCoffeeShop(CoffeeShopRequestDTO requestDTO) {

        CoffeeShop newShop = coffeeShopMapper.toEntity(requestDTO);

        CoffeeShop savedShop = coffeeShopRepository.save(newShop);

        return coffeeShopMapper.toDetailsDto(savedShop);
    }

    @Transactional
    public List<OperatingHoursResponseDTO> updateOperatingHours(Long coffeeShopId, List<OperatingHoursRequestDTO> scheduleRequests) {

        CoffeeShop shop = coffeeShopRepository.findById(coffeeShopId)
                .orElseThrow(() -> new ResourceNotFoundException("Coffee shop not found with id: " + coffeeShopId));

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
}
