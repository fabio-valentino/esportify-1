<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Penyelenggara extends Model
{
    protected $table = 'penyelenggara';

    protected $primaryKey = 'id_penyelenggara';

    protected $fillable = [
        'id_player',
    ];

    public function player(): BelongsTo
    {
        return $this->belongsTo(
            Player::class,
            'id_player',
            'id_player'
        );
    }

    public function turnamen(): HasMany
    {
        return $this->hasMany(
            Turnamen::class,
            'id_penyelenggara',
            'id_penyelenggara'
        );
    }
}
?>