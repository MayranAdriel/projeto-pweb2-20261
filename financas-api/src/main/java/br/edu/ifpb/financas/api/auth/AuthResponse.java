package br.edu.ifpb.financas.api.auth;

public record AuthResponse(String token, Long id, String username, String name) {}

