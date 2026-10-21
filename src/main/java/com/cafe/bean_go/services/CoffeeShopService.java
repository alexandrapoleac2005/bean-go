package com.cafe.bean_go.services;

import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopDetailsDTO;
import com.cafe.bean_go.dtos.coffeeshop.CoffeeShopSummaryDTO;
import com.cafe.bean_go.entities.CoffeeShop;
import com.cafe.bean_go.mappers.CoffeeShopMapper;
import com.cafe.bean_go.repositories.CoffeeShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CoffeeShopService {
    private final CoffeeShopRepository coffeeShopRepository;
    private final CoffeeShopMapper coffeeShopMapper;

    public List<CoffeeShopSummaryDTO> getAllCoffeeShopsSummary()
    {
        List<CoffeeShop> coffeeShops= coffeeShopRepository.findAll();

        return coffeeShops.stream().map(coffeeShopMapper::toSummaryDto).collect(Collectors.toList());
    }

    public CoffeeShopDetailsDTO getCoffeeShopById(Long id)
    {
        CoffeeShop coffeeShop= coffeeShopRepository.findById(id).orElseThrow(()->new RuntimeException("Cafeneaua cu ID-ul " + id + " nu a fost găsită!"));

        return coffeeShopMapper.toDetailsDto(coffeeShop);
    }


}
