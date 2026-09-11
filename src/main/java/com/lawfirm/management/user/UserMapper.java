package com.lawfirm.management.user;
import com.lawfirm.management.user.dto.UserResponse;
import org.mapstruct.Mapper;
@Mapper(componentModel = "spring")
public interface UserMapper { UserResponse toResponse(User user); }
