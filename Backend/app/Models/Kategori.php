<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Kategori extends Model
{
    protected $table = 'kategoris';

    protected $primaryKey = 'id_kategori';

    protected $fillable = [
        'id_admin',
        'nama_kategori',
    ];

    // Relasi Kategori dengan Admin
    public function admin(): BelongsTo
    {
        return $this->belongsTo(
            Admin::class,
            'id_admin',
            'id_admin'
        );
    }

    // Relasi Kategori dengan Game
    public function games(): BelongsToMany
    {
        return $this->belongsToMany(
            Game::class,
            'kategori_game',
            'id_kategori',
            'id_game',
            'id_kategori',
            'id_game'
        );
    }
}
?>