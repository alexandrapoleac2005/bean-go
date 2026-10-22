package com.cafe.bean_go.services;

import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopDetailsResponseDTO;
import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopSummaryResponseDTO;
import com.cafe.bean_go.dtos.menu.MenuItemRequestDTO;
import com.cafe.bean_go.entities.CoffeeShop;
import com.cafe.bean_go.entities.MenuItem;
import com.cafe.bean_go.exceptions.ResourceNotFoundException;
import com.cafe.bean_go.mappers.CoffeeShopMapper;
import com.cafe.bean_go.repositories.CoffeeShopRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CoffeeShopService {
    private final CoffeeShopRepository coffeeShopRepository;
    private final CoffeeShopMapper coffeeShopMapper;

    public List<CoffeeShopSummaryResponseDTO> getAllCoffeeShopsSummary() {
        List<CoffeeShop> coffeeShops = coffeeShopRepository.findByIsApprovedTrue();

        return coffeeShops.stream().map(coffeeShopMapper::toSummaryDto).collect(Collectors.toList());
    }

    public CoffeeShopDetailsResponseDTO getCoffeeShopById(Long id) {
        CoffeeShop coffeeShop = coffeeShopRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Coffee shop with ID " + id + " not found!"));

        return coffeeShopMapper.toDetailsDto(coffeeShop);
    }

    @Transactional
    public CoffeeShopDetailsResponseDTO addMenuItemToCoffeeShop(Long coffeeShopId, MenuItemRequestDTO itemDto) {
        CoffeeShop shop = coffeeShopRepository.findById(coffeeShopId).orElseThrow(() -> new ResourceNotFoundException("Coffee shop with ID " + coffeeShopId + " not found!"));

        MenuItem newItem = coffeeShopMapper.toMenuItemEntity(itemDto);

        newItem.setCoffeeShop(shop);

        shop.getMenuItems().add(newItem);

        return coffeeShopMapper.toDetailsDto(shop);

    }

    @Transactional
    public CoffeeShopDetailsResponseDTO updateMenuItem(Long coffeeShopId, Long itemId, MenuItemRequestDTO itemDto) {

        CoffeeShop shop = coffeeShopRepository.findById(coffeeShopId)
                .orElseThrow(() -> new ResourceNotFoundException("Coffee shop with ID " + coffeeShopId + " not found!"));

        MenuItem itemToUpdate = shop.getMenuItems().stream()
                .filter(item->item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(()->new ResourceNotFoundException("Menu item with ID " + itemId + " not found in this coffee shop!"));

        itemToUpdate.setName(itemDto.getName());
        itemToUpdate.setCategory(itemDto.getCategory());
        itemToUpdate.setPrice(itemDto.getPrice());
        itemToUpdate.setDescription(itemDto.getDescription());

        return coffeeShopMapper.toDetailsDto(shop);
    }

    @Transactional
    public void deleteMenuItem(Long coffeeShopId, Long itemId) {

        CoffeeShop shop = coffeeShopRepository.findById(coffeeShopId)
                .orElseThrow(()-> new ResourceNotFoundException("Coffee shop with ID " + coffeeShopId + " not found!"));

        MenuItem itemToRemove = shop.getMenuItems().stream()
                .filter(item->item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(()->new ResourceNotFoundException("Menu item with ID " + itemId + " not found in this coffee shop!"));

        shop.getMenuItems().remove(itemToRemove);
    }

}
